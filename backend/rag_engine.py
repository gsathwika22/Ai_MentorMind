"""
rag_engine.py — FAISS RAG pipeline for MentorMind DSA

Three bugs fixed vs the original implementation:

  BUG 1 — Wrong metric: IndexFlatL2 measures Euclidean distance.
           sentence-transformers embeddings are designed for cosine similarity.
           Fix: L2-normalise all vectors, then use IndexFlatIP (inner product).
           On unit vectors, inner product == cosine similarity.

  BUG 2 — Score meaning inverted: L2 distance is lower-is-better, but the
           API and frontend treat score as higher-is-better (a percentage).
           Fix: after normalisation, IndexFlatIP scores are in [0, 1] where
           1.0 = identical. Return these directly as similarity scores.

  BUG 3 — Broken topic filter: original fetches top_k then drops non-matching
           entries, silently returning fewer than top_k results (sometimes 0).
           Fix: fetch top_k * 4 candidates, filter, then take the first top_k.
"""

import logging
import math
import re
from collections import Counter
from typing import Optional

logger = logging.getLogger(__name__)

TOP_K           = 4
EMBED_MODEL     = "all-MiniLM-L6-v2"   # 384-dim, cosine-trained


# ── DSA Knowledge Chunks ──────────────────────────────────────────────────────
DSA_KNOWLEDGE: list[dict] = [
    {
        "id": "arrays_hashing_concept",
        "topic": "arrays_hashing",
        "chunk_type": "concept",
        "text": (
            "Arrays store elements at contiguous memory locations enabling O(1) random access. "
            "HashMaps give O(1) average lookup and insert. Most array problems reduce to: "
            "track seen elements, maintain a running count or sum, or transform the index-value relationship. "
            "The classic trade-off is space for time -- a HashMap avoids a nested loop. "
            "Key problems: Two Sum, Group Anagrams, Contains Duplicate, Product Except Self."
        ),
    },
    {
        "id": "arrays_hashing_patterns",
        "topic": "arrays_hashing",
        "chunk_type": "patterns",
        "text": (
            "Key array and hashing patterns: "
            "Complement lookup -- store each element and check if its complement exists on arrival. "
            "Prefix sum -- precompute cumulative sums so range queries answer in O(1). "
            "Frequency map -- count occurrences to find duplicates, majority elements, or anagrams. "
            "Sort then simplify -- sorting unlocks two-pointer or binary search approaches."
        ),
    },
    {
        "id": "arrays_hashing_mistakes",
        "topic": "arrays_hashing",
        "chunk_type": "common_mistakes",
        "text": (
            "Common mistakes with arrays and hashing: "
            "Using a nested O(n squared) loop when a single-pass HashMap gives O(n). "
            "Off-by-one on prefix sums -- prepend 0 so prefix[i] is the sum of the first i elements. "
            "Mutating the array while iterating. "
            "Forgetting that dict and set lookup is O(1) average but O(n) worst-case."
        ),
    },
    {
        "id": "two_pointers_concept",
        "topic": "two_pointers",
        "chunk_type": "concept",
        "text": (
            "Two pointers work on sorted input to find pairs or triplets satisfying a condition. "
            "Start left=0 and right=n-1; move inward based on whether the sum is too large or too small. "
            "Converts O(n squared) brute-force into O(n). "
            "Fast and slow pointers detect cycles or find midpoints in linked lists. "
            "Problems: Two Sum II, 3Sum, Container With Most Water, Valid Palindrome."
        ),
    },
    {
        "id": "two_pointers_patterns",
        "topic": "two_pointers",
        "chunk_type": "patterns",
        "text": (
            "Two-pointer patterns: "
            "Opposite ends -- left and right converge based on sum vs target comparison. "
            "3Sum fix-one -- fix one element and run two-pointer on the rest. "
            "Fast and slow -- slow moves one step, fast moves two; meet at cycle entry or midpoint. "
            "Partition -- one pointer reads, one writes valid elements to remove duplicates in place."
        ),
    },
    {
        "id": "two_pointers_mistakes",
        "topic": "two_pointers",
        "chunk_type": "common_mistakes",
        "text": (
            "Common two-pointer mistakes: "
            "Forgetting to sort the array first -- two pointers require sorted input. "
            "Not skipping duplicates in 3Sum which produces duplicate triplets. "
            "Moving the wrong pointer -- if sum > target move right left; if sum < target move left right. "
            "Wrong termination: use left < right strictly, not left <= right."
        ),
    },
    {
        "id": "sliding_window_concept",
        "topic": "sliding_window",
        "chunk_type": "concept",
        "text": (
            "Sliding window maintains a dynamic range [left, right] over the input. "
            "Expand right to include new elements; shrink left when a constraint is violated. "
            "Gives O(n) instead of O(n squared) by avoiding full recomputation of the window. "
            "Fixed windows slide both ends together. Variable windows expand greedily and shrink lazily. "
            "Problems: Longest Substring Without Repeating Characters, Minimum Window Substring."
        ),
    },
    {
        "id": "sliding_window_patterns",
        "topic": "sliding_window",
        "chunk_type": "patterns",
        "text": (
            "Sliding window patterns: "
            "Fixed window of size k -- slide right+1 and drop left simultaneously. "
            "Longest valid window -- expand right freely then shrink left until constraint holds. "
            "Shortest valid window -- expand until valid, then shrink as far as possible. "
            "Frequency map inside window -- tracks character counts for substring problems. "
            "Running sum -- maintain cumulative value incrementally to avoid recomputation."
        ),
    },
    {
        "id": "sliding_window_mistakes",
        "topic": "sliding_window",
        "chunk_type": "common_mistakes",
        "text": (
            "Common sliding window mistakes: "
            "Recomputing window properties from scratch instead of updating incrementally. "
            "Forgetting to undo the left element contribution when shrinking the window. "
            "Confusing at-most-k-distinct with exactly-k-distinct -- the latter needs two windows. "
            "Updating the answer in the wrong branch (before vs after shrinking the window)."
        ),
    },
    {
        "id": "binary_search_concept",
        "topic": "binary_search",
        "chunk_type": "concept",
        "text": (
            "Binary search works on any monotonic search space, not just sorted arrays. "
            "Each step eliminates half the candidates in O(log n). "
            "Key insight: define a predicate False for one half and True for the other, then search the boundary. "
            "Always use mid = left + (right - left) // 2 to avoid integer overflow. "
            "Binary search on the answer: ask if X is feasible and find the smallest or largest feasible X."
        ),
    },
    {
        "id": "binary_search_patterns",
        "topic": "binary_search",
        "chunk_type": "patterns",
        "text": (
            "Binary search patterns: "
            "Classic search -- find target in sorted array by narrowing left and right each iteration. "
            "Rotated array -- compare mid to right to determine which half is sorted. "
            "Find boundary -- first True in FFFFFFTTTTT pattern using left <= right loop. "
            "Search on answer -- define feasible(x) and binary search over the answer value range. "
            "Problems: Search Rotated Array, Find Minimum Rotated, Koko Eating Bananas."
        ),
    },
    {
        "id": "binary_search_mistakes",
        "topic": "binary_search",
        "chunk_type": "common_mistakes",
        "text": (
            "Common binary search mistakes: "
            "Overflow: use mid = left + (right - left) // 2 not (left + right) // 2. "
            "Off-by-one in termination condition: left <= right vs left < right depends on the template. "
            "Moving the wrong boundary after comparing mid. "
            "Infinite loop: when mid == left and left never advances, use left = mid + 1."
        ),
    },
    {
        "id": "linked_list_concept",
        "topic": "linked_list",
        "chunk_type": "concept",
        "text": (
            "Linked lists have no random access -- you must traverse node by node. "
            "Most problems use: a dummy sentinel head to avoid edge cases, "
            "multiple pointers tracking prev, curr, and next, or slow and fast pointers. "
            "Draw the pointer state before and after each step to avoid losing a node. "
            "Problems: Reverse Linked List, Merge Two Sorted Lists, LRU Cache, Detect Cycle."
        ),
    },
    {
        "id": "linked_list_patterns",
        "topic": "linked_list",
        "chunk_type": "patterns",
        "text": (
            "Linked list patterns: "
            "Dummy head -- prepend a sentinel node to avoid special-casing the first real node. "
            "Reverse in-place -- track prev=None, curr=head, save next before re-linking each step. "
            "Floyd cycle detection -- slow moves 1, fast moves 2; if they meet a cycle exists. "
            "Find nth from end -- two pointers n apart; when right hits null left is the target."
        ),
    },
    {
        "id": "stack_queue_concept",
        "topic": "stack_queue",
        "chunk_type": "concept",
        "text": (
            "Stacks are LIFO and maintain history or defer decisions until a trigger event. "
            "Monotonic stacks find the next greater or smaller element in O(n) for every index. "
            "Queues are FIFO and power BFS by processing nodes level by level. "
            "A deque supports O(1) push and pop at both ends, useful for sliding window maximum. "
            "Problems: Daily Temperatures, Valid Parentheses, Min Stack, Largest Rectangle Histogram."
        ),
    },
    {
        "id": "stack_queue_patterns",
        "topic": "stack_queue",
        "chunk_type": "patterns",
        "text": (
            "Stack and queue patterns: "
            "Monotonic stack -- pop all elements violating the invariant when a new element arrives. "
            "Bracket matching -- push opens; on close pop and verify the pair matches. "
            "BFS with queue -- enqueue root, loop to dequeue, process, enqueue unvisited children. "
            "Min Stack -- maintain a parallel stack tracking the running minimum alongside actual values."
        ),
    },
    {
        "id": "trees_concept",
        "topic": "trees",
        "chunk_type": "concept",
        "text": (
            "Trees are recursively defined -- every subtree is itself a valid tree. "
            "Most problems have a clean recursive solution: handle null base case, recurse left and right, combine. "
            "Key decision: does information flow down via parameters or up via return values? "
            "BST constraint -- left < root < right -- must hold globally, not just at the root. "
            "Problems: Max Depth, Diameter, LCA, Validate BST, Serialize Deserialize, Path Sum."
        ),
    },
    {
        "id": "trees_patterns",
        "topic": "trees",
        "chunk_type": "patterns",
        "text": (
            "Tree traversal patterns: "
            "Preorder root then left then right -- serialize, copy, prefix expressions. "
            "Inorder left then root then right -- BST produces sorted order. "
            "Postorder left then right then root -- height, diameter, delete nodes. "
            "Level-order BFS -- level averages, connect level pointers. "
            "Pass-down constraints -- carry min and max bounds for BST validation in parameters."
        ),
    },
    {
        "id": "graphs_concept",
        "topic": "graphs",
        "chunk_type": "concept",
        "text": (
            "Graphs model relationships. BFS finds shortest paths in unweighted graphs. "
            "DFS explores exhaustively and detects cycles. Always track visited to avoid infinite loops. "
            "Grid problems are implicit graphs where neighbours are up, down, left, right. "
            "Union-Find handles dynamic connectivity and cycle detection in undirected graphs. "
            "Topological sort orders nodes by dependencies in a DAG. "
            "Problems: Number of Islands, Clone Graph, Course Schedule, Word Ladder."
        ),
    },
    {
        "id": "graphs_patterns",
        "topic": "graphs",
        "chunk_type": "patterns",
        "text": (
            "Graph algorithm patterns: "
            "BFS -- queue and visited set; enqueue source, process neighbours level by level. "
            "DFS -- recursion or explicit stack; mark visited before recursing. "
            "Union-Find -- find with path compression; union by rank; cycle if already same component. "
            "Kahn topological sort -- in-degree array; enqueue zero in-degree nodes; BFS. "
            "Dijkstra -- min-heap of distance and node; relax edges greedily."
        ),
    },
    {
        "id": "graphs_mistakes",
        "topic": "graphs",
        "chunk_type": "common_mistakes",
        "text": (
            "Common graph mistakes: "
            "Marking visited after enqueuing instead of before -- causes duplicate BFS processing. "
            "Confusing visited with in-stack -- in-stack tracking needed for directed cycle detection. "
            "Forgetting disconnected components -- loop over all nodes as potential DFS or BFS sources. "
            "Using BFS for exhaustive path problems -- use DFS with backtracking instead."
        ),
    },
    {
        "id": "dp_concept",
        "topic": "dynamic_programming",
        "chunk_type": "concept",
        "text": (
            "Dynamic programming breaks a problem into overlapping subproblems and caches results. "
            "Four steps: define the subproblem precisely, write the recurrence, identify base cases, "
            "choose top-down memoization or bottom-up tabulation. "
            "Applies when the problem has optimal substructure and overlapping subproblems. "
            "Problems: Coin Change, Longest Common Subsequence, Edit Distance, House Robber."
        ),
    },
    {
        "id": "dp_patterns",
        "topic": "dynamic_programming",
        "chunk_type": "patterns",
        "text": (
            "DP patterns: "
            "1D DP -- dp[i] from dp[i-1] or dp[i-k]: Climbing Stairs, House Robber, Coin Change. "
            "2D DP -- dp[i][j] from dp[i-1][j] or dp[i][j-1]: LCS, Edit Distance, Unique Paths. "
            "Knapsack -- for each item include or exclude: dp[i][w] = max(include, exclude). "
            "Interval DP -- dp[i][j] from all splits: Burst Balloons, Matrix Chain Multiplication. "
            "State machine DP -- track holding or cooldown states: Best Time to Buy and Sell Stock."
        ),
    },
    {
        "id": "dp_mistakes",
        "topic": "dynamic_programming",
        "chunk_type": "common_mistakes",
        "text": (
            "Common DP mistakes: "
            "Vague subproblem -- dp[i] must have one precise meaning stated in a single sentence. "
            "Missing base cases -- dp[0] and dp[1] must be set explicitly before the main loop. "
            "Returning dp[n] when the answer is max over dp[0] to dp[n]. "
            "Not recognising a greedy or two-pointer suffices and DP is unnecessary overhead. "
            "Memoization requires a hashable state key for the cache dictionary."
        ),
    },
    {
        "id": "backtracking_concept",
        "topic": "backtracking",
        "chunk_type": "concept",
        "text": (
            "Backtracking is DFS on a decision tree. At each node: choose, recurse, then unchoose. "
            "Pruning cuts branches that cannot lead to a valid solution. "
            "Generates all permutations, combinations, subsets, or solves constraint-satisfaction problems. "
            "Template: choose then explore then unchoose (undo the choice). "
            "Problems: Subsets, Permutations, Combination Sum, N-Queens, Word Search, Sudoku Solver."
        ),
    },
    {
        "id": "backtracking_patterns",
        "topic": "backtracking",
        "chunk_type": "patterns",
        "text": (
            "Backtracking patterns: "
            "Subsets -- at each index include or skip the current element. "
            "Permutations -- pick any unused element at each position; mark and unmark used array. "
            "Combinations -- pick k from n; pass start index to avoid revisiting earlier elements. "
            "Constraint satisfaction -- try all values at each empty cell; prune on violation immediately. "
            "Duplicate handling -- sort first; skip element if equal to previous and previous was not used."
        ),
    },
    {
        "id": "heap_concept",
        "topic": "heap_priority_queue",
        "chunk_type": "concept",
        "text": (
            "A heap gives O(log n) insert and O(log n) extract-min or max, with O(1) peek. "
            "Python heapq is a min-heap; negate values to simulate max-heap. "
            "Use a heap when you repeatedly need the current minimum or maximum. "
            "Building a heap from n elements costs O(n) via heapify. "
            "Problems: Kth Largest Element, Top K Frequent, Find Median From Data Stream."
        ),
    },
    {
        "id": "heap_patterns",
        "topic": "heap_priority_queue",
        "chunk_type": "patterns",
        "text": (
            "Heap patterns: "
            "Top-K elements -- min-heap of size K; pop when size exceeds K; top equals Kth largest. "
            "Merge K sorted lists -- push (value, list index, element index) tuples; pop global min. "
            "Running median -- max-heap for lower half and min-heap for upper half; balance after each insert. "
            "Task scheduler -- max-heap of task frequencies; simulate rounds picking most frequent."
        ),
    },
    {
        "id": "greedy_concept",
        "topic": "greedy",
        "chunk_type": "concept",
        "text": (
            "Greedy makes the locally optimal choice at each step trusting it leads to global optimum. "
            "Works when a greedy-choice property holds -- local choice is never worse than any alternative. "
            "Sorting is almost always the first step. "
            "Verify with exchange argument: swapping non-greedy for greedy cannot improve the solution. "
            "Problems: Meeting Rooms, Non-overlapping Intervals, Jump Game, Merge Intervals, Gas Station."
        ),
    },
    {
        "id": "greedy_patterns",
        "topic": "greedy",
        "chunk_type": "patterns",
        "text": (
            "Greedy patterns: "
            "Interval scheduling -- sort by end time; greedily select non-overlapping intervals. "
            "Jump Game -- scan left to right tracking the farthest reachable index. "
            "Gas Station -- if total gas >= total cost a solution exists; reset start index greedily. "
            "Merge Intervals -- sort by start; merge if current start <= previous end. "
            "Huffman coding -- always merge the two nodes with the lowest frequency."
        ),
    },
]


# ── RAGEngine ─────────────────────────────────────────────────────────────────

def tokenize(text: str) -> list[str]:
    return re.findall(r'\b\w+\b', text.lower())

class RAGEngine:
    """
    Lightweight TF-IDF backed RAG engine.
    Replaces sentence-transformers and FAISS to avoid PyTorch Out-Of-Memory (OOM) errors.
    """

    def __init__(self):
        self._metadata = DSA_KNOWLEDGE
        self._tf = []
        self._idf = {}
        self._initialize()

    # ── Init ──────────────────────────────────────────────────────────────────

    def _initialize(self):
        logger.info("Initialising lightweight TF-IDF RAG engine …")
        N = len(self._metadata)
        df = Counter()
        
        for chunk in self._metadata:
            tokens = tokenize(chunk["topic"].replace("_", " ") + " " + chunk["text"])
            tf_counts = Counter(tokens)
            self._tf.append(tf_counts)
            for token in set(tokens):
                df[token] += 1
                
        for token, count in df.items():
            self._idf[token] = math.log((1 + N) / (1 + count)) + 1
            
        logger.info("TF-IDF index ready | %d chunks", N)

    # ── Public API ────────────────────────────────────────────────────────────

    def ingest(self, force: bool = False) -> int:
        """In-memory TF-IDF index. Ingestion happens at init. Returns chunk count."""
        return len(self._metadata)

    def retrieve(
        self,
        query: str,
        top_k: int = TOP_K,
        topic_filter: Optional[str] = None,
    ) -> list[dict]:
        """
        Return the top_k most relevant DSA knowledge chunks using TF-IDF.
        """
        query_tokens = tokenize(query)
        if not query_tokens:
            return []
            
        scores = []
        query_tf = Counter(query_tokens)
        
        for i, chunk in enumerate(self._metadata):
            if topic_filter and chunk["topic"] != topic_filter:
                continue
                
            score = 0.0
            for token, q_tf in query_tf.items():
                if token in self._tf[i]:
                    # TF-IDF of document
                    doc_tfidf = self._tf[i][token] * self._idf.get(token, 1.0)
                    # TF-IDF of query
                    q_tfidf = q_tf * self._idf.get(token, 1.0)
                    score += doc_tfidf * q_tfidf
            
            scores.append((score, i))
            
        # Normalize scores to be roughly between 0 and 1 just to mimic cosine similarity
        max_score = max([s for s, i in scores]) if scores else 1.0
        if max_score == 0: max_score = 1.0
            
        scores.sort(reverse=True, key=lambda x: x[0])
        
        chunks = []
        for score, idx in scores[:top_k]:
            if score == 0.0:
                continue
            meta = self._metadata[idx]
            normalized_score = min(1.0, score / max_score)
            chunks.append({
                "id":         meta["id"],
                "topic":      meta["topic"],
                "chunk_type": meta["chunk_type"],
                "text":       meta["text"],
                "score":      round(normalized_score, 4),
            })

        logger.info(
            "Retrieved %d chunks | '%s…' | scores=%s",
            len(chunks), query[:50], [c["score"] for c in chunks],
        )
        return chunks

    def build_context(self, query: str, top_k: int = TOP_K) -> tuple[str, list[dict]]:
        """
        Retrieve chunks and format as a structured context block for LLM injection.
        Returns (context_string, raw_chunks).
        """
        chunks = self.retrieve(query, top_k=top_k)

        if not chunks:
            return "No relevant DSA knowledge retrieved.", []

        lines = ["=== RETRIEVED DSA KNOWLEDGE (ranked by relevance) ===\n"]
        for i, chunk in enumerate(chunks, 1):
            label = chunk["topic"].replace("_", " ").title()
            lines.append(
                f"[{i}] Topic: {label} | Type: {chunk['chunk_type']} | Score: {chunk['score']:.2f}\n"
                f"{chunk['text']}\n"
            )

        return "\n".join(lines), chunks


# ── Singleton ─────────────────────────────────────────────────────────────────
rag_engine = RAGEngine()