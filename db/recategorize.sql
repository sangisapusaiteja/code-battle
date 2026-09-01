-- ============================================================
-- CODE BATTLE — Re-categorize existing problems into the new
-- category scheme. Run this in the Supabase SQL editor (or as a
-- migration) to update the LIVE database.
--
-- New categories:
--   Arrays, Strings, Bit Manipulation, Hash Tables, Two Pointers,
--   Prefix Sum, Sliding Window - Fixed Size, Sliding Window - Dynamic Size,
--   Kadane's Algorithm, Matrix (2D Array), Linked List, LinkedList In-place Reversal
-- ============================================================

begin;

-- ---------- Arrays ----------
update public.cb_problems set category = 'Arrays' where slug in (
  'max-consecutive-ones',
  'third-maximum-number',
  'move-zeroes',
  'shuffle-the-array',
  'majority-element',
  'remove-duplicates-from-sorted-array',
  'remove-element',
  'best-time-to-buy-and-sell-stock',
  'missing-ranges',
  'majority-element-ii',
  'rotate-array',
  'product-of-array-except-self',
  'remove-duplicates-from-sorted-array-ii',
  'best-time-to-buy-and-sell-stock-ii',
  'number-of-zero-filled-subarrays',
  'increasing-triplet-subsequence',
  'next-permutation',
  'first-missing-positive',
  'evaluate-reverse-polish-notation',
  'next-greater-element-i'
);

-- ---------- Strings ----------
update public.cb_problems set category = 'Strings' where slug in (
  'reverse-string',
  'length-of-last-word',
  'is-subsequence',
  'valid-palindrome',
  'valid-palindrome-ii',
  'valid-anagram',
  'rotate-string',
  'longest-common-prefix',
  'longest-palindrome',
  'find-the-index-of-the-first-occurrence-in-a-string',
  'one-edit-distance',
  'zigzag-conversion',
  'count-and-say',
  'reverse-words-in-a-string',
  'determine-if-two-strings-are-close',
  'add-bold-tag-in-string',
  'text-justification',
  'guess-the-word',
  'basic-calculator-ii',
  'longest-valid-parentheses',
  'remove-all-adjacent-duplicates-in-string',
  'remove-duplicate-letters',
  'removing-stars-from-a-string',
  'valid-parentheses'
);

-- ---------- Bit Manipulation ----------
update public.cb_problems set category = 'Bit Manipulation' where slug in (
  'single-number',
  'missing-number',
  'set-mismatch',
  'power-of-two',
  'number-of-1-bits',
  'counting-bits',
  'hamming-distance',
  'reverse-bits',
  'bitwise-and-of-numbers-range',
  'single-number-ii',
  'single-number-iii',
  'sum-of-two-integers'
);

-- ---------- Hash Tables ----------
update public.cb_problems set category = 'Hash Tables' where slug in (
  'contains-duplicate',
  'word-pattern',
  'first-unique-character-in-a-string',
  'find-all-numbers-disappeared-in-an-array',
  'maximum-number-of-balloons',
  'number-of-good-pairs',
  'isomorphic-strings',
  'ransom-note',
  'contains-duplicate-ii',
  'intersection-of-two-arrays-ii',
  'group-anagrams',
  'reorganize-string',
  'longest-consecutive-sequence',
  'split-array-into-consecutive-subsequences',
  'number-of-matching-subsequences',
  'number-of-good-ways-to-split-a-string',
  'group-shifted-strings',
  'minimum-deletions-to-make-character-frequencies-unique',
  'happy-number'
);

-- ---------- Two Pointers ----------
update public.cb_problems set category = 'Two Pointers' where slug in (
  'merge-sorted-array',
  'merge-strings-alternately',
  'squares-of-a-sorted-array',
  'two-sum',
  'backspace-string-compare',
  'valid-word-abbreviation',
  'count-binary-substrings',
  'two-sum-ii-input-array-is-sorted',
  'container-with-most-water',
  '3sum',
  '4sum',
  'string-compression',
  'trapping-rain-water'
);

-- ---------- Prefix Sum ----------
update public.cb_problems set category = 'Prefix Sum' where slug in (
  'subarray-sum-equals-k',
  'subarray-sums-divisible-by-k',
  'continuous-subarray-sum',
  'contiguous-array'
);

-- ---------- Sliding Window - Fixed Size ----------
update public.cb_problems set category = 'Sliding Window - Fixed Size' where slug in (
  'maximum-average-subarray-i',
  'find-all-anagrams-in-a-string',
  'permutation-in-string',
  'maximum-sum-of-distinct-subarrays-with-length-k',
  'substring-with-concatenation-of-all-words'
);

-- ---------- Sliding Window - Dynamic Size ----------
update public.cb_problems set category = 'Sliding Window - Dynamic Size' where slug in (
  'longest-substring-without-repeating-characters',
  'longest-repeating-character-replacement',
  'minimum-size-subarray-sum',
  'max-consecutive-ones-iii',
  'minimum-window-substring'
);

-- ---------- Kadane's Algorithm ----------
update public.cb_problems set category = 'Kadane''s Algorithm' where slug in (
  'maximum-subarray',
  'maximum-sum-circular-subarray',
  'maximum-product-subarray',
  'best-sightseeing-pair'
);

-- ---------- Matrix (2D Array) ----------
update public.cb_problems set category = 'Matrix (2D Array)' where slug in (
  'game-of-life',
  'rotate-image',
  'set-matrix-zeroes',
  'spiral-matrix',
  'valid-sudoku'
);

-- ---------- Linked List ----------
update public.cb_problems set category = 'Linked List' where slug in (
  'add-two-numbers',
  'copy-list-with-random-pointer',
  'intersection-of-two-linked-lists',
  'partition-list',
  'remove-duplicates-from-sorted-list-ii',
  'remove-nth-node-from-end-of-list',
  'rotate-list',
  'swap-nodes-in-pairs',
  'linked-list-cycle-ii',
  'middle-of-the-linked-list'
);

-- ---------- LinkedList In-place Reversal ----------
update public.cb_problems set category = 'LinkedList In-place Reversal' where slug in (
  'palindrome-linked-list',
  'reverse-linked-list',
  'reverse-linked-list-ii',
  'reverse-nodes-in-k-group'
);

commit;
