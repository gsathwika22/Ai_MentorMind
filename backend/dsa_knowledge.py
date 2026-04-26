"""
DSA RAG Knowledge Base — MentorMind for LeetCode / DSA problems.
Each topic has: keywords, concept, hints, approach_questions, common_mistakes, patterns.
"""

DSA_KNOWLEDGE = {
    "arrays_hashing": {
        "keywords": [
            "array", "subarray", "duplicate", "frequency", "count", "hash", "hashmap",
            "hashtable", "dictionary", "index", "element", "sum", "prefix", "suffix",
            "two sum", "anagram", "contains", "majority element", "rotate array",
        ],
        "concept": (
            "Arrays store elements at contiguous memory locations. HashMaps give O(1) "
            "average lookup/insert. Most array problems reduce to: track seen elements, "
            "maintain a running count, or transform the index-value relationship."
        ),
        "patterns": [
            "Use a HashMap to trade space for time — store complements, frequencies, or indices.",
            "Prefix sum arrays let you answer range-sum queries in O(1) after O(n) preprocessing.",
            "Sorting an array often unlocks simpler comparisons or two-pointer approaches.",
        ],
        "hints": [
            "What information do you need to 'remember' as you scan through the array once?",
            "If you stored each element in a HashMap as you go, what could you look up instantly?",
            "Can a prefix-sum array help you avoid recomputing sums over and over?",
            "What happens if you sort the array first — does the problem become easier?",
            "Think about what complement or pair you're searching for at each index.",
        ],
        "approach_questions": [
            "Have you considered a single-pass solution — what would you track in each step?",
            "What is the exact condition that makes two elements a valid pair/match?",
            "Can you reduce O(n²) comparisons to O(n) using extra space?",
            "What's the invariant — what stays true at the start of every iteration?",
        ],
        "common_mistakes": [
            "Using a nested loop (O(n²)) when a HashMap reduces it to O(n)",
            "Off-by-one errors on prefix sum arrays (forgetting to prepend 0)",
            "Modifying the array while iterating over it",
        ],
    },

    "two_pointers": {
        "keywords": [
            "two pointers", "left right", "sorted array", "pair", "triplet",
            "palindrome", "container water", "3sum", "two sum sorted",
            "remove duplicates", "valid palindrome", "squeeze", "converge",
        ],
        "concept": (
            "Two pointers work when the array is sorted (or can be sorted) and you need "
            "to find pairs/triplets satisfying a condition. Pointers start at opposite ends "
            "and move inward based on a comparison — this turns O(n²) search into O(n)."
        ),
        "patterns": [
            "Left pointer starts at 0, right at n-1; move based on whether current sum is too big or too small.",
            "Fast/slow pointers detect cycles or find midpoints in linked lists.",
            "For 3Sum: fix one element, then run two-pointer on the rest.",
        ],
        "hints": [
            "If the array were sorted, what would moving the left pointer do to the sum?",
            "What condition tells you to move the left pointer vs the right pointer?",
            "Can you reduce a 3-element problem to a 2-element subproblem you already know how to solve?",
            "When do you know the current window/pair is valid? When do you know to shrink it?",
            "Think about what invariant is maintained as the pointers move.",
        ],
        "approach_questions": [
            "Does sorting the input first unlock a two-pointer approach here?",
            "What does it mean when left + right > target vs < target?",
            "How do you handle duplicate values to avoid counting the same triplet twice?",
            "What stops the two pointers from crossing — is that your termination condition?",
        ],
        "common_mistakes": [
            "Forgetting to sort the array before applying two pointers",
            "Not skipping duplicate values, leading to duplicate triplets in 3Sum",
            "Incorrect pointer movement logic (moving the wrong pointer)",
        ],
    },

    "sliding_window": {
        "keywords": [
            "sliding window", "substring", "subarray", "longest", "shortest",
            "window", "contiguous", "at most k", "exactly k", "minimum size",
            "maximum sum", "no repeat", "distinct characters", "anagram in string",
        ],
        "concept": (
            "Sliding window maintains a dynamic range [left, right] over the input. "
            "Expand right to include new elements; shrink left when a constraint is violated. "
            "This avoids recomputing the entire window from scratch — O(n) instead of O(n²)."
        ),
        "patterns": [
            "Fixed window: right - left + 1 == k; slide both pointers together.",
            "Variable window: expand right freely, shrink left until constraint holds again.",
            "Use a frequency map inside the window to track what's currently included.",
        ],
        "hints": [
            "What is the 'constraint' that decides when your window is too large?",
            "When you move the left pointer, what do you need to undo from your running state?",
            "Can you maintain a running sum/count instead of recomputing it every time?",
            "What exactly defines a 'valid' window for this problem?",
            "Think about what you want to maximise/minimise — is it the window size or the window sum?",
        ],
        "approach_questions": [
            "Is this a fixed-size window or a variable-size window problem?",
            "What state (sum, count, frequency map) do you need to maintain inside the window?",
            "When does the window become invalid, and how do you restore validity?",
            "Are you looking for the first valid window, the longest, or the shortest?",
        ],
        "common_mistakes": [
            "Recomputing window properties from scratch instead of updating incrementally",
            "Not updating the left pointer's contribution when shrinking the window",
            "Confusing 'at most k distinct' with 'exactly k distinct' problems",
        ],
    },

    "binary_search": {
        "keywords": [
            "binary search", "sorted", "search", "target", "find element",
            "rotated", "peak", "minimum", "first last position", "kth smallest",
            "search space", "monotonic", "feasible", "mid",
        ],
        "concept": (
            "Binary search works on any monotonic search space — not just sorted arrays. "
            "Each step eliminates half the candidates. Key insight: define a predicate that "
            "is False for one half and True for the other, then binary-search the boundary."
        ),
        "patterns": [
            "Classic: mid = left + (right - left) // 2 to avoid overflow.",
            "For 'find minimum in rotated array': compare mid to right to decide which half is sorted.",
            "Binary search on the answer: ask 'is X feasible?' and search for the smallest/largest feasible X.",
        ],
        "hints": [
            "What property lets you discard half the search space at each step?",
            "Is there a predicate (True/False function) such that the array looks like FFFFFFTTTTT?",
            "When you compute mid, which half do you eliminate and why?",
            "For rotated arrays: which side is guaranteed to be sorted based on comparing mid to the endpoints?",
            "Can you binary-search on the answer itself rather than the array index?",
        ],
        "approach_questions": [
            "What is your search space — indices, values, or something else?",
            "What condition tells you the target is in the left half vs the right half?",
            "How do you handle duplicates — do they affect which half you discard?",
            "What are your loop invariants — what's guaranteed at the start of each iteration?",
        ],
        "common_mistakes": [
            "Integer overflow in (left + right) // 2 — use left + (right - left) // 2",
            "Off-by-one errors with left <= right vs left < right termination",
            "Moving the wrong boundary after the mid comparison",
        ],
    },

    "linked_list": {
        "keywords": [
            "linked list", "node", "next", "head", "tail", "cycle", "reverse",
            "merge", "middle", "nth from end", "pointer", "singly", "doubly",
            "LRU", "flatten", "reorder list",
        ],
        "concept": (
            "Linked lists have no random access — you must traverse. "
            "Most problems are solved with: a dummy head node, multiple pointers, "
            "or slow/fast pointers. Visualise pointer changes before coding — it's easy to lose a node."
        ),
        "patterns": [
            "Dummy/sentinel node at the head avoids special-casing the first element.",
            "Slow/fast pointer: after cycle detection or finding midpoint.",
            "Reverse: track prev, curr, next — update all three every step.",
        ],
        "hints": [
            "Have you drawn the pointer state before and after one step?",
            "A dummy head node often eliminates messy edge cases — have you considered it?",
            "For cycle detection: what does it mean if the fast pointer catches the slow one?",
            "When reversing, what three things must you save before changing any pointer?",
            "Can the slow/fast pointer technique find what you're looking for here?",
        ],
        "approach_questions": [
            "How many pointers do you need, and what does each one represent?",
            "What's the base case — empty list, single node, two nodes?",
            "Are you modifying the list in-place or building a new one?",
            "What information do you lose if you change a pointer too early?",
        ],
        "common_mistakes": [
            "Losing the rest of the list by updating curr.next before saving it",
            "Not handling the empty list or single-node edge cases",
            "Forgetting to set the last node's next to None after reversing",
        ],
    },

    "stack_queue": {
        "keywords": [
            "stack", "queue", "monotonic", "bracket", "parenthesis", "valid",
            "next greater", "daily temperatures", "min stack", "evaluate",
            "reverse polish", "BFS", "level order", "deque", "push", "pop",
        ],
        "concept": (
            "Stacks (LIFO) maintain history or pending decisions. "
            "Monotonic stacks find the next greater/smaller element in O(n). "
            "Queues (FIFO) power BFS — level-by-level graph/tree traversal."
        ),
        "patterns": [
            "Monotonic stack: pop elements from the stack whenever the invariant (increasing/decreasing) is broken.",
            "For bracket matching: push opens, pop and compare when you see a close.",
            "BFS with a queue: enqueue the root, then process level by level.",
        ],
        "hints": [
            "What's the invariant your stack must always satisfy after each push/pop?",
            "When you see a closing bracket, what do you need to check on the stack?",
            "For 'next greater element': when does an element on the stack finally get its answer?",
            "Could a monotonic stack process this in a single left-to-right pass?",
            "Is BFS (queue) or DFS (stack/recursion) more natural for this traversal?",
        ],
        "approach_questions": [
            "What does an element waiting on the stack represent while it's there?",
            "What event triggers an element to be popped — what resolves its 'waiting'?",
            "For this problem, do you need LIFO (stack) or FIFO (queue) ordering?",
            "Can you solve this in a single pass using a stack to defer decisions?",
        ],
        "common_mistakes": [
            "Forgetting to check if the stack is empty before popping",
            "Using a stack when BFS (queue) is more appropriate, or vice versa",
            "Breaking the monotonic invariant by not popping all violating elements",
        ],
    },

    "trees": {
        "keywords": [
            "tree", "binary tree", "BST", "root", "leaf", "height", "depth",
            "inorder", "preorder", "postorder", "level order", "diameter",
            "lowest common ancestor", "LCA", "path sum", "balanced", "subtree",
            "serialize", "deserialize", "trie", "prefix tree",
        ],
        "concept": (
            "Trees are recursively defined — every subtree is itself a tree. "
            "Most tree problems have a clean recursive solution: handle the base case (null), "
            "recurse on left and right, then combine the results."
        ),
        "patterns": [
            "Return value from recursion: carry up the answer (height, path sum, bool).",
            "Pass down information: carry down constraints (min/max for BST validation).",
            "DFS (preorder/inorder/postorder) vs BFS (level-order) — choose based on what you need.",
        ],
        "hints": [
            "What should your recursive function return, and what does it need from each subtree?",
            "What's the base case — what do you return for a null node?",
            "Do you need information flowing down (parameters) or up (return values)?",
            "For BST problems: what constraint must hold at every node, not just the root?",
            "Can you compute the answer at each node using only what the left and right subtrees return?",
        ],
        "approach_questions": [
            "Which traversal order — pre, in, post, or level-order — gives you what you need?",
            "What does your function return from a leaf node? From a null node?",
            "Is the answer stored at a node, or computed from combining subtree results?",
            "For LCA: what are the three cases based on where p and q appear?",
        ],
        "common_mistakes": [
            "Forgetting the null base case, causing attribute errors on None",
            "Assuming BST validity only at the root — the constraint must hold globally",
            "Not tracking the path correctly in path-sum problems (backtracking needed)",
        ],
    },

    "graphs": {
        "keywords": [
            "graph", "node", "edge", "vertex", "adjacency", "BFS", "DFS",
            "connected", "component", "cycle", "topological", "bipartite",
            "shortest path", "Dijkstra", "union find", "islands", "grid",
            "visited", "path", "course schedule", "clone graph",
        ],
        "concept": (
            "Graphs model relationships. BFS finds shortest paths (unweighted). "
            "DFS explores exhaustively and detects cycles. "
            "Always track visited nodes to avoid infinite loops. "
            "Grid problems are just graphs where neighbours are up/down/left/right."
        ),
        "patterns": [
            "BFS from source: use a queue + visited set; process level by level.",
            "DFS: use recursion or explicit stack; mark visited before recursing.",
            "Union-Find: efficient for connected-components and cycle detection in undirected graphs.",
            "Topological sort (Kahn's or DFS): for dependency ordering in DAGs.",
        ],
        "hints": [
            "Have you handled the visited set so you don't process the same node twice?",
            "For grid problems: treat each cell as a node with up to 4 neighbours.",
            "Is BFS (level-by-level, shortest path) or DFS (exhaustive, cycle detection) better here?",
            "For cycle detection in directed graphs: track nodes in the current recursion stack.",
            "Can Union-Find tell you whether adding this edge creates a cycle?",
        ],
        "approach_questions": [
            "How will you represent the graph — adjacency list, matrix, or implicit (grid)?",
            "What does one 'step' of BFS/DFS look like for this specific problem?",
            "What information do you need per node beyond just 'visited'?",
            "Is there a topological ordering here? What are the dependencies?",
        ],
        "common_mistakes": [
            "Marking nodes as visited after enqueuing instead of before — causes duplicates in BFS",
            "Not checking for cycles in directed graphs (in-stack vs just visited)",
            "Missing disconnected components — looping over all nodes, not just one start",
        ],
    },

    "dynamic_programming": {
        "keywords": [
            "dynamic programming", "DP", "memoization", "tabulation", "subproblem",
            "fibonacci", "coin change", "knapsack", "longest common subsequence",
            "LCS", "LIS", "edit distance", "climbing stairs", "partition",
            "palindrome", "house robber", "optimal", "minimum cost", "maximum profit",
        ],
        "concept": (
            "DP breaks a problem into overlapping subproblems and stores results to avoid recomputation. "
            "Key steps: (1) define the subproblem, (2) write the recurrence, "
            "(3) identify base cases, (4) decide top-down (memo) or bottom-up (table)."
        ),
        "patterns": [
            "1D DP: dp[i] depends on dp[i-1] or dp[i-k] — e.g., climbing stairs, house robber.",
            "2D DP: dp[i][j] from dp[i-1][j], dp[i][j-1], dp[i-1][j-1] — e.g., LCS, edit distance.",
            "Knapsack: for each item, choose to include or exclude it.",
        ],
        "hints": [
            "Can you define dp[i] (or dp[i][j]) clearly — what does it represent?",
            "What smaller subproblem must be solved before you can solve dp[i]?",
            "What are the base cases — the smallest inputs you can answer directly?",
            "Have you tried a recursive solution with memoization first, then converting to tabulation?",
            "Is the answer dp[n], or do you need to scan the entire table for the maximum?",
        ],
        "approach_questions": [
            "What decision is made at each step, and how does it affect the subproblem?",
            "What does dp[i] represent — be precise. Can you verify it with a small example?",
            "What's the recurrence — how does dp[i] depend on smaller dp values?",
            "Where does the optimal substructure come from in this problem?",
        ],
        "common_mistakes": [
            "Ill-defined subproblem — dp[i] means something vague or inconsistent",
            "Missing base cases, especially dp[0] or dp[1]",
            "Returning dp[n] when the answer might be max(dp[0..n])",
        ],
    },

    "backtracking": {
        "keywords": [
            "backtracking", "permutation", "combination", "subset", "generate",
            "all possible", "N-queens", "sudoku", "word search", "path",
            "choose", "explore", "unchoose", "pruning", "candidates",
        ],
        "concept": (
            "Backtracking = DFS on a decision tree. At each step: choose an option, "
            "recurse, then undo the choice (backtrack). Pruning skips invalid branches early. "
            "Template: choose → explore → unchoose."
        ),
        "patterns": [
            "Subsets: at each index, include or skip the current element.",
            "Permutations: at each position, pick any unused element.",
            "Combinations: pick k elements from n, no repeats, order doesn't matter.",
            "Prune early: if the current path already violates constraints, return immediately.",
        ],
        "hints": [
            "What is the 'choice' made at each node of the decision tree?",
            "What does it mean to 'backtrack' here — what exactly do you undo?",
            "What constraint lets you prune this branch early without exploring further?",
            "When do you add the current path to your result — at every node or only at leaves?",
            "How do you avoid generating duplicate combinations (e.g., sorting + skipping)?",
        ],
        "approach_questions": [
            "What are the possible choices at each recursive call?",
            "What's the base case — when do you stop recursing and record a result?",
            "How do you ensure you don't reuse the same element twice (if not allowed)?",
            "What pruning condition would cut off clearly invalid branches immediately?",
        ],
        "common_mistakes": [
            "Forgetting to undo the choice after recursing (mutation without backtrack)",
            "Adding the current list by reference — snapshot it with list(current) or current[:]",
            "Not sorting first when duplicates need to be skipped",
        ],
    },

    "heap_priority_queue": {
        "keywords": [
            "heap", "priority queue", "kth largest", "kth smallest", "top k",
            "median", "merge k sorted", "task scheduler", "min heap", "max heap",
            "heapify", "nlargest", "nsmallest",
        ],
        "concept": (
            "A heap gives O(log n) insert and O(log n) extract-min/max. "
            "Python's heapq is a min-heap; for max-heap, negate values. "
            "Use a heap when you repeatedly need the smallest or largest element."
        ),
        "patterns": [
            "Top-K elements: maintain a heap of size K; pop when size exceeds K.",
            "Kth largest: use a min-heap of size K — the top is the Kth largest.",
            "Merge K sorted lists: push (value, list_index, element_index) and pop the min.",
        ],
        "hints": [
            "Do you need the minimum or maximum repeatedly? A heap gives that in O(log n).",
            "For 'top K': do you really need to sort everything, or just track the K biggest?",
            "Python's heapq is a min-heap — how would you adapt it for a max-heap?",
            "Can you process elements one by one, maintaining a heap of the best K seen so far?",
            "For the median: two heaps (a max-heap for lower half, min-heap for upper half) stay balanced.",
        ],
        "approach_questions": [
            "How many elements do you actually need to track at any given time?",
            "What does the top of your heap represent at any point in the algorithm?",
            "When do you push to the heap, and when do you pop?",
            "Is sorting the whole array simpler here, or is a heap more efficient?",
        ],
        "common_mistakes": [
            "Using a max-heap when a min-heap suffices (or forgetting to negate for max-heap in Python)",
            "Not maintaining the heap size constraint — letting it grow unbounded",
            "Confusing Kth largest (min-heap size K) with Kth smallest (max-heap size K)",
        ],
    },

    "greedy": {
        "keywords": [
            "greedy", "interval", "meeting rooms", "jump game", "gas station",
            "activity selection", "schedule", "merge intervals", "non-overlapping",
            "earliest deadline", "minimum platforms", "always choose",
        ],
        "concept": (
            "Greedy makes the locally optimal choice at each step, hoping it leads to global optimum. "
            "It works when a greedy choice property holds — you can prove the local choice is safe. "
            "Sorting is almost always the first step in greedy interval problems."
        ),
        "patterns": [
            "Interval scheduling: sort by end time, greedily pick non-overlapping intervals.",
            "Jump Game: track the farthest reachable index as you scan.",
            "Gas Station: if total gas >= total cost, a solution exists; find the start greedily.",
        ],
        "hints": [
            "What is the 'greedy choice' — what do you always pick first at each step?",
            "Can you prove that the greedy choice never closes off a better solution?",
            "Sorting by what criterion makes the greedy choice obvious?",
            "Try thinking about what the optimal solution must look like, then see if greedy matches it.",
            "For interval problems: should you sort by start time or end time?",
        ],
        "approach_questions": [
            "What locally optimal decision leads to a globally optimal solution here?",
            "What order should you process elements in for the greedy to work?",
            "Can you construct a counterexample where greedy fails? (If not, it's likely correct.)",
            "Is there an exchange argument — can you swap any non-greedy choice for the greedy one without making things worse?",
        ],
        "common_mistakes": [
            "Applying greedy without verifying the greedy choice property (it doesn't always work)",
            "Sorting by the wrong criterion",
            "Forgetting to handle ties in the sorting key",
        ],
    },
}


def detect_topic(message: str) -> dict:
    """Return the best-matching DSA topic data for the given message."""
    message_lower = message.lower()
    best_topic = None
    best_count = 0

    for topic, data in DSA_KNOWLEDGE.items():
        count = sum(1 for kw in data["keywords"] if kw in message_lower)
        if count > best_count:
            best_count = count
            best_topic = topic

    if best_topic and best_count > 0:
        return {"topic": best_topic, **DSA_KNOWLEDGE[best_topic]}
    return {}