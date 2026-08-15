-- ============================================================
-- CODE BATTLE — More problems (Strings, Bit Manipulation, Hash Maps)
-- Run in the Supabase SQL Editor. Idempotent (safe to re-run).
-- ============================================================

insert into public.problems (slug, title, description, difficulty, category, constraints, starter_code, function_name) values
-- ============ STRINGS ============
('length-of-last-word', 'Length of Last Word',
 'Given a string s consisting of words and spaces, return the length of the last word in the string. A word is a maximal substring consisting of non-space characters only.',
 'easy', 'Strings',
 '1 <= s.length <= 10^4; s consists of only English letters and spaces',
 'function lengthOfLastWord(s) {\n  // Return the length of the last word\n}',
 'lengthOfLastWord'),
('is-subsequence', 'Is Subsequence',
 'Given two strings s and t, return true if s is a subsequence of t, or false otherwise. A subsequence is a sequence that can be derived from another sequence by deleting some or no elements without changing the order of the remaining elements.',
 'easy', 'Strings',
 '0 <= s.length <= 100; 0 <= t.length <= 10^4',
 'function isSubsequence(s, t) {\n  // Return true if s is a subsequence of t\n}',
 'isSubsequence'),
('valid-palindrome', 'Valid Palindrome',
 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Given a string s, return true if it is a palindrome, or false otherwise.',
 'easy', 'Strings',
 '1 <= s.length <= 2 * 10^5',
 'function isPalindrome(s) {\n  // Return true if s is a valid palindrome\n}',
 'isPalindrome'),
('valid-palindrome-ii', 'Valid Palindrome II',
 'Given a string s, return true if the s can be palindrome after deleting at most one character from it.',
 'easy', 'Strings',
 '1 <= s.length <= 10^5',
 'function validPalindrome(s) {\n  // Return true if s can be a palindrome by deleting at most one char\n}',
 'validPalindrome'),
('valid-anagram', 'Valid Anagram',
 'Given two strings s and t, return true if t is an anagram of s, and false otherwise. An anagram is a word or phrase formed by rearranging the letters of a different word or phrase.',
 'easy', 'Strings',
 '1 <= s.length <= 5 * 10^4; s and t consist of lowercase English letters',
 'function isAnagram(s, t) {\n  // Return true if t is an anagram of s\n}',
 'isAnagram'),
('rotate-string', 'Rotate String',
 'Given two strings s and goal, return true if and only if s can become goal after some number of shifts on s. A shift on s consists of moving the leftmost character of s to the rightmost position.',
 'easy', 'Strings',
 '1 <= s.length, goal.length <= 100',
 'function rotateString(s, goal) {\n  // Return true if s can become goal after shifts\n}',
 'rotateString'),
('longest-common-prefix', 'Longest Common Prefix',
 'Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string.',
 'easy', 'Strings',
 '1 <= strs.length <= 200; 0 <= strs[i].length <= 200',
 'function longestCommonPrefix(strs) {\n  // Return the longest common prefix\n}',
 'longestCommonPrefix'),
('longest-palindrome', 'Longest Palindrome',
 'Given a string s which consists of lowercase or uppercase letters, return the length of the longest palindrome that can be built with those letters. Letters are case sensitive.',
 'easy', 'Strings',
 '1 <= s.length <= 2000',
 'function longestPalindrome(s) {\n  // Return the length of the longest palindrome\n}',
 'longestPalindrome'),
('find-the-index-of-the-first-occurrence-in-a-string', 'Find the Index of the First Occurrence in a String',
 'Given two strings needle and haystack, return the index of the first occurrence of needle in haystack, or -1 if needle is not part of haystack.',
 'easy', 'Strings',
 '1 <= haystack.length, needle.length <= 10^4',
 'function strStr(haystack, needle) {\n  // Return the index of the first occurrence of needle\n}',
 'strStr'),
('one-edit-distance', 'One Edit Distance',
 'Given two strings s and t, return true if they are both one edit distance apart, otherwise return false. A string s is said to be one edit distance apart from a string t if you can apply exactly one of the following operations to s to get t: insert one character, delete one character, or replace one character.',
 'medium', 'Strings',
 '0 <= s.length, t.length <= 10^4',
 'function isOneEditDistance(s, t) {\n  // Return true if s and t are one edit distance apart\n}',
 'isOneEditDistance'),
('zigzag-conversion', 'Zigzag Conversion',
 'The string "PAYPALISHIRING" is written in a zigzag pattern on a given number of rows. Given a string s and an integer numRows, return the string read row by row.',
 'medium', 'Strings',
 '1 <= s.length <= 1000; 1 <= numRows <= 1000',
 'function convert(s, numRows) {\n  // Return the zigzag-converted string\n}',
 'convert'),
('count-and-say', 'Count and Say',
 'The count-and-say sequence is a sequence of digit strings defined by the recursive formula. Given a positive integer n, return the nth term of the count-and-say sequence.',
 'medium', 'Strings',
 '1 <= n <= 30',
 'function countAndSay(n) {\n  // Return the nth term of the count-and-say sequence\n}',
 'countAndSay'),
('reverse-words-in-a-string', 'Reverse Words in a String',
 'Given an input string s, reverse the order of the words. A word is defined as a sequence of non-space characters. The words in s will be separated by at least one space. Return a string of the words in reverse order concatenated by a single space.',
 'medium', 'Strings',
 '1 <= s.length <= 10^4; s contains English letters, digits, and spaces',
 'function reverseWords(s) {\n  // Return the words in reverse order\n}',
 'reverseWords'),
('determine-if-two-strings-are-close', 'Determine if Two Strings Are Close',
 'Two strings are considered close if you can attain one from the other using the following operations: swap any two existing characters, or transform every occurrence of one existing character into another existing character. Given two strings word1 and word2, return true if they are close.',
 'medium', 'Strings',
 '1 <= word1.length, word2.length <= 10^5',
 'function closeStrings(word1, word2) {\n  // Return true if word1 and word2 are close\n}',
 'closeStrings'),
('add-bold-tag-in-string', 'Add Bold Tag in String',
 'You are given a string s and an array of strings words. You should add a closed pair of bold tags <b> and </b> to wrap the substrings in s that exist in words. If two such substrings overlap, you should wrap them together. Return the resulting string.',
 'medium', 'Strings',
 '1 <= s.length <= 1000; 0 <= words.length <= 100',
 'function addBoldTag(s, words) {\n  // Return s with bold tags added\n}',
 'addBoldTag'),
('text-justification', 'Text Justification',
 'Given an array of strings words and a width maxWidth, format the text such that each line has exactly maxWidth characters and is fully justified. Return the formatted lines.',
 'hard', 'Strings',
 '1 <= words.length <= 300; 1 <= words[i].length <= 20; 1 <= maxWidth <= 100',
 'function fullJustify(words, maxWidth) {\n  // Return the fully justified lines\n}',
 'fullJustify'),

-- ============ BIT MANIPULATION ============
('single-number', 'Single Number',
 'Given a non-empty array of integers nums, every element appears twice except for one. Find that single one. You must implement a solution with a linear runtime complexity and use only constant extra space.',
 'easy', 'Bit Manipulation',
 '1 <= nums.length <= 3 * 10^4; -3 * 10^4 <= nums[i] <= 3 * 10^4',
 'function singleNumber(nums) {\n  // Return the element that appears only once\n}',
 'singleNumber'),
('missing-number', 'Missing Number',
 'Given an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing from the array.',
 'easy', 'Bit Manipulation',
 'n == nums.length; 1 <= n <= 10^4; 0 <= nums[i] <= n',
 'function missingNumber(nums) {\n  // Return the missing number\n}',
 'missingNumber'),
('set-mismatch', 'Set Mismatch',
 'You have a set of integers s, which originally contains all the numbers from 1 to n. Unfortunately, due to some error, one of the numbers in s got duplicated to another number in the set. Return the array nums of size 2 where nums[0] is the number that occurs twice and nums[1] is the number that is missing.',
 'easy', 'Bit Manipulation',
 '2 <= nums.length <= 10^4; 1 <= nums[i] <= 10^4',
 'function findErrorNums(nums) {\n  // Return [duplicate, missing]\n}',
 'findErrorNums'),
('power-of-two', 'Power of Two',
 'Given an integer n, return true if it is a power of two. An integer n is a power of two, if there exists an integer x such that n == 2^x.',
 'easy', 'Bit Manipulation',
 '-2^31 <= n <= 2^31 - 1',
 'function isPowerOfTwo(n) {\n  // Return true if n is a power of two\n}',
 'isPowerOfTwo'),
('number-of-1-bits', 'Number of 1 Bits',
 'Write a function that takes the binary representation of an unsigned integer and returns the number of set bits it has (also known as the Hamming weight).',
 'easy', 'Bit Manipulation',
 'The input must be a binary string of length 32',
 'function hammingWeight(n) {\n  // Return the number of 1 bits\n}',
 'hammingWeight'),
('counting-bits', 'Counting Bits',
 'Given an integer n, return an array ans of length n + 1 such that for each i (0 <= i <= n), ans[i] is the number of 1s in the binary representation of i.',
 'easy', 'Bit Manipulation',
 '0 <= n <= 10^5',
 'function countBits(n) {\n  // Return an array of bit counts for 0..n\n}',
 'countBits'),
('hamming-distance', 'Hamming Distance',
 'The Hamming distance between two integers is the number of positions at which the corresponding bits are different. Given two integers x and y, return the Hamming distance between them.',
 'easy', 'Bit Manipulation',
 '0 <= x, y <= 2^31 - 1',
 'function hammingDistance(x, y) {\n  // Return the Hamming distance\n}',
 'hammingDistance'),
('bitwise-and-of-numbers-range', 'Bitwise AND of Numbers Range',
 'Given two integers left and right that represent the range [left, right], return the bitwise AND of all numbers in this range, inclusive.',
 'medium', 'Bit Manipulation',
 '0 <= left <= right <= 2^31 - 1',
 'function rangeBitwiseAnd(left, right) {\n  // Return the bitwise AND of the range\n}',
 'rangeBitwiseAnd'),
('single-number-ii', 'Single Number II',
 'Given an integer array nums where every element appears three times except for one, which appears exactly once. Find the single element and return it.',
 'medium', 'Bit Manipulation',
 '1 <= nums.length <= 3 * 10^4; -2^31 <= nums[i] <= 2^31 - 1',
 'function singleNumber(nums) {\n  // Return the element that appears exactly once\n}',
 'singleNumber'),
('single-number-iii', 'Single Number III',
 'Given an integer array nums, in which exactly two elements appear only once and all the other elements appear exactly twice. Find the two elements that appear only once. Return the answer in any order.',
 'medium', 'Bit Manipulation',
 '2 <= nums.length <= 3 * 10^4; -2^31 <= nums[i] <= 2^31 - 1',
 'function singleNumber(nums) {\n  // Return the two elements that appear only once\n}',
 'singleNumber'),
('sum-of-two-integers', 'Sum of Two Integers',
 'Given two integers a and b, return the sum of the two integers without using the operators + and -.',
 'medium', 'Bit Manipulation',
 '-1000 <= a, b <= 1000',
 'function getSum(a, b) {\n  // Return the sum of a and b without using + or -\n}',
 'getSum'),

-- ============ HASH MAPS ============
('contains-duplicate', 'Contains Duplicate',
 'Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.',
 'easy', 'Hash Maps',
 '1 <= nums.length <= 10^5; -10^9 <= nums[i] <= 10^9',
 'function containsDuplicate(nums) {\n  // Return true if any value appears at least twice\n}',
 'containsDuplicate'),
('word-pattern', 'Word Pattern',
 'Given a pattern and a string s, find if s follows the same pattern. Here follow means a full match, such that there is a bijection between a letter in pattern and a non-empty word in s.',
 'easy', 'Hash Maps',
 '1 <= pattern.length <= 300; 1 <= s.length <= 3000',
 'function wordPattern(pattern, s) {\n  // Return true if s follows the pattern\n}',
 'wordPattern'),
('first-unique-character-in-a-string', 'First Unique Character in a String',
 'Given a string s, find the first non-repeating character in it and return its index. If it does not exist, return -1.',
 'easy', 'Hash Maps',
 '1 <= s.length <= 10^5',
 'function firstUniqChar(s) {\n  // Return the index of the first non-repeating character\n}',
 'firstUniqChar'),
('find-all-numbers-disappeared-in-an-array', 'Find All Numbers Disappeared in an Array',
 'Given an array nums of n integers where nums[i] is in the range [1, n], return an array of all the integers in the range [1, n] that do not appear in nums.',
 'easy', 'Hash Maps',
 'n == nums.length; 1 <= n <= 10^5; 1 <= nums[i] <= n',
 'function findDisappearedNumbers(nums) {\n  // Return all numbers in [1, n] that do not appear\n}',
 'findDisappearedNumbers'),
('maximum-number-of-balloons', 'Maximum Number of Balloons',
 'Given a string text, you want to use the characters of text to form the words "balloon". Return the maximum number of instances that can be formed.',
 'easy', 'Hash Maps',
 '1 <= text.length <= 10^4',
 'function maxNumberOfBalloons(text) {\n  // Return the max number of "balloon" instances\n}',
 'maxNumberOfBalloons'),
('number-of-good-pairs', 'Number of Good Pairs',
 'Given an array of integers nums, return the number of good pairs. A pair (i, j) is called good if nums[i] == nums[j] and i < j.',
 'easy', 'Hash Maps',
 '1 <= nums.length <= 100; 1 <= nums[i] <= 100',
 'function numIdenticalPairs(nums) {\n  // Return the number of good pairs\n}',
 'numIdenticalPairs'),
('isomorphic-strings', 'Isomorphic Strings',
 'Given two strings s and t, determine if they are isomorphic. Two strings s and t are isomorphic if the characters in s can be replaced to get t.',
 'easy', 'Hash Maps',
 '1 <= s.length <= 5 * 10^4; t.length == s.length',
 'function isIsomorphic(s, t) {\n  // Return true if s and t are isomorphic\n}',
 'isIsomorphic'),
('ransom-note', 'Ransom Note',
 'Given two strings ransomNote and magazine, return true if ransomNote can be constructed by using the letters from magazine and false otherwise. Each letter in magazine can only be used once in ransomNote.',
 'easy', 'Hash Maps',
 '1 <= ransomNote.length, magazine.length <= 10^5',
 'function canConstruct(ransomNote, magazine) {\n  // Return true if ransomNote can be constructed from magazine\n}',
 'canConstruct'),
('contains-duplicate-ii', 'Contains Duplicate II',
 'Given an integer array nums and an integer k, return true if there are two distinct indices i and j in the array such that nums[i] == nums[j] and abs(i - j) <= k.',
 'easy', 'Hash Maps',
 '1 <= nums.length <= 10^5; -10^9 <= nums[i] <= 10^9; 0 <= k <= 10^5',
 'function containsNearbyDuplicate(nums, k) {\n  // Return true if a duplicate within distance k exists\n}',
 'containsNearbyDuplicate'),
('intersection-of-two-arrays-ii', 'Intersection of Two Arrays II',
 'Given two integer arrays nums1 and nums2, return an array of their intersection. Each element in the result must appear as many times as it shows in both arrays.',
 'easy', 'Hash Maps',
 '1 <= nums1.length, nums2.length <= 1000; 0 <= nums1[i], nums2[i] <= 1000',
 'function intersect(nums1, nums2) {\n  // Return the intersection array\n}',
 'intersect'),
('reorganize-string', 'Reorganize String',
 'Given a string s, rearrange the characters of s so that any two adjacent characters are not the same. Return any possible rearrangement, or return an empty string if not possible.',
 'medium', 'Hash Maps',
 '1 <= s.length <= 500',
 'function reorganizeString(s) {\n  // Return a rearranged string or empty string\n}',
 'reorganizeString'),
('longest-consecutive-sequence', 'Longest Consecutive Sequence',
 'Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence. You must write an algorithm that runs in O(n) time.',
 'medium', 'Hash Maps',
 '0 <= nums.length <= 10^5; -10^9 <= nums[i] <= 10^9',
 'function longestConsecutive(nums) {\n  // Return the length of the longest consecutive sequence\n}',
 'longestConsecutive'),
('split-array-into-consecutive-subsequences', 'Split Array into Consecutive Subsequences',
 'You are given an integer array nums that is sorted in non-decreasing order. Determine if it is possible to split nums into one or more subsequences such that each subsequence consists of consecutive integers and has length of at least 3. Return true if you can split, false otherwise.',
 'medium', 'Hash Maps',
 '1 <= nums.length <= 10^4; -1000 <= nums[i] <= 1000',
 'function isPossible(nums) {\n  // Return true if nums can be split into consecutive subsequences\n}',
 'isPossible'),
('number-of-matching-subsequences', 'Number of Matching Subsequences',
 'Given a string s and an array of strings words, return the number of words[i] that is a subsequence of s.',
 'medium', 'Hash Maps',
 '1 <= s.length <= 5 * 10^4; 1 <= words.length <= 5000; 1 <= words[i].length <= 50',
 'function numMatchingSubseq(s, words) {\n  // Return the number of words that are subsequences of s\n}',
 'numMatchingSubseq'),
('number-of-good-ways-to-split-a-string', 'Number of Good Ways to Split a String',
 'You are given a string s. A split is called good if you can split s into two non-empty strings s_left and s_right such that their concatenation is equal to s and the number of distinct letters in s_left and s_right is the same. Return the number of good splits you can make.',
 'medium', 'Hash Maps',
 '1 <= s.length <= 10^5',
 'function numSplits(s) {\n  // Return the number of good splits\n}',
 'numSplits'),
('minimum-deletions-to-make-character-frequencies-unique', 'Minimum Deletions to Make Character Frequencies Unique',
 'A string s is called good if there are no two different characters in s that have the same frequency. Given a string s, return the minimum number of characters you need to delete to make s good.',
 'medium', 'Hash Maps',
 '1 <= s.length <= 10^5',
 'function minDeletions(s) {\n  // Return the minimum deletions to make frequencies unique\n}',
 'minDeletions')
on conflict (slug) do nothing;

-- ============ TEST CASES ============

-- Length of Last Word
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["Hello World"]', '5', true, 0 from public.problems p where p.slug='length-of-last-word';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["   fly me   to   the moon  "]', '4', false, 1 from public.problems p where p.slug='length-of-last-word';

-- Is Subsequence
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["abc","ahbgdc"]', 'true', true, 0 from public.problems p where p.slug='is-subsequence';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["axc","ahbgdc"]', 'false', false, 1 from public.problems p where p.slug='is-subsequence';

-- Valid Palindrome
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["A man, a plan, a canal: Panama"]', 'true', true, 0 from public.problems p where p.slug='valid-palindrome';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["race a car"]', 'false', false, 1 from public.problems p where p.slug='valid-palindrome';

-- Valid Palindrome II
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["aba"]', 'true', true, 0 from public.problems p where p.slug='valid-palindrome-ii';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["abca"]', 'true', false, 1 from public.problems p where p.slug='valid-palindrome-ii';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["abc"]', 'false', false, 2 from public.problems p where p.slug='valid-palindrome-ii';

-- Valid Anagram
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["anagram","nagaram"]', 'true', true, 0 from public.problems p where p.slug='valid-anagram';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["rat","car"]', 'false', false, 1 from public.problems p where p.slug='valid-anagram';

-- Rotate String
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["abcde","cdeab"]', 'true', true, 0 from public.problems p where p.slug='rotate-string';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["abcde","abced"]', 'false', false, 1 from public.problems p where p.slug='rotate-string';

-- Longest Common Prefix
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[["flower","flow","flight"]]', '"fl"', true, 0 from public.problems p where p.slug='longest-common-prefix';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[["dog","racecar","car"]]', '""', false, 1 from public.problems p where p.slug='longest-common-prefix';

-- Longest Palindrome
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["abccccdd"]', '7', true, 0 from public.problems p where p.slug='longest-palindrome';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["a"]', '1', false, 1 from public.problems p where p.slug='longest-palindrome';

-- Find the Index of the First Occurrence in a String
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["sadbutsad","sad"]', '0', true, 0 from public.problems p where p.slug='find-the-index-of-the-first-occurrence-in-a-string';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["leetcode","leeto"]', '-1', false, 1 from public.problems p where p.slug='find-the-index-of-the-first-occurrence-in-a-string';

-- One Edit Distance
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["ab","acb"]', 'true', true, 0 from public.problems p where p.slug='one-edit-distance';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["",""]', 'false', false, 1 from public.problems p where p.slug='one-edit-distance';

-- Zigzag Conversion
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["PAYPALISHIRING",3]', '"PAHNAPLSIIGYIR"', true, 0 from public.problems p where p.slug='zigzag-conversion';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["PAYPALISHIRING",4]', '"PINALSIGYAHRPI"', false, 1 from public.problems p where p.slug='zigzag-conversion';

-- Count and Say
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[1]', '"1"', true, 0 from public.problems p where p.slug='count-and-say';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[4]', '"1211"', false, 1 from public.problems p where p.slug='count-and-say';

-- Reverse Words in a String
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["the sky is blue"]', '"blue is sky the"', true, 0 from public.problems p where p.slug='reverse-words-in-a-string';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["  hello world  "]', '"world hello"', false, 1 from public.problems p where p.slug='reverse-words-in-a-string';

-- Determine if Two Strings Are Close
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["abc","bca"]', 'true', true, 0 from public.problems p where p.slug='determine-if-two-strings-are-close';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["a","aa"]', 'false', false, 1 from public.problems p where p.slug='determine-if-two-strings-are-close';

-- Add Bold Tag in String
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["abcxyz123",["abc","123"]]', '"<b>abc</b>xyz<b>123</b>"', true, 0 from public.problems p where p.slug='add-bold-tag-in-string';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["aaabbcc",["aaa","aab","bc"]]', '"<b>aaabbc</b>c"', false, 1 from public.problems p where p.slug='add-bold-tag-in-string';

-- Text Justification
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[["This","is","an","example","of","text","justification."],16]', '["This    is    an","example  of text","justification.  "]', true, 0 from public.problems p where p.slug='text-justification';

-- Single Number
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[[2,2,1]]', '1', true, 0 from public.problems p where p.slug='single-number';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[[4,1,2,1,2]]', '4', false, 1 from public.problems p where p.slug='single-number';

-- Missing Number
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[[3,0,1]]', '2', true, 0 from public.problems p where p.slug='missing-number';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[[0,1]]', '2', false, 1 from public.problems p where p.slug='missing-number';

-- Set Mismatch
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[[1,2,2,4]]', '[2,3]', true, 0 from public.problems p where p.slug='set-mismatch';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[[1,1]]', '[1,2]', false, 1 from public.problems p where p.slug='set-mismatch';

-- Power of Two
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[1]', 'true', true, 0 from public.problems p where p.slug='power-of-two';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[16]', 'true', false, 1 from public.problems p where p.slug='power-of-two';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[3]', 'false', false, 2 from public.problems p where p.slug='power-of-two';

-- Number of 1 Bits
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[11]', '3', true, 0 from public.problems p where p.slug='number-of-1-bits';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[128]', '1', false, 1 from public.problems p where p.slug='number-of-1-bits';

-- Counting Bits
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[2]', '[0,1,1]', true, 0 from public.problems p where p.slug='counting-bits';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[5]', '[0,1,1,2,1,2]', false, 1 from public.problems p where p.slug='counting-bits';

-- Hamming Distance
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[1,4]', '2', true, 0 from public.problems p where p.slug='hamming-distance';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[3,1]', '1', false, 1 from public.problems p where p.slug='hamming-distance';

-- Bitwise AND of Numbers Range
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[5,7]', '4', true, 0 from public.problems p where p.slug='bitwise-and-of-numbers-range';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[1,2147483647]', '0', false, 1 from public.problems p where p.slug='bitwise-and-of-numbers-range';

-- Single Number II
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[[2,2,3,2]]', '3', true, 0 from public.problems p where p.slug='single-number-ii';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[[0,1,0,1,0,1,99]]', '99', false, 1 from public.problems p where p.slug='single-number-ii';

-- Single Number III
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[[1,2,1,3,2,5]]', '[3,5]', true, 0 from public.problems p where p.slug='single-number-iii';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[[-1,0]]', '[-1,0]', false, 1 from public.problems p where p.slug='single-number-iii';

-- Sum of Two Integers
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[1,2]', '3', true, 0 from public.problems p where p.slug='sum-of-two-integers';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[2,3]', '5', false, 1 from public.problems p where p.slug='sum-of-two-integers';

-- Contains Duplicate
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[[1,2,3,1]]', 'true', true, 0 from public.problems p where p.slug='contains-duplicate';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[[1,2,3,4]]', 'false', false, 1 from public.problems p where p.slug='contains-duplicate';

-- Word Pattern
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["abba","dog cat cat dog"]', 'true', true, 0 from public.problems p where p.slug='word-pattern';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["abba","dog cat cat fish"]', 'false', false, 1 from public.problems p where p.slug='word-pattern';

-- First Unique Character in a String
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["leetcode"]', '0', true, 0 from public.problems p where p.slug='first-unique-character-in-a-string';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["loveleetcode"]', '2', false, 1 from public.problems p where p.slug='first-unique-character-in-a-string';

-- Find All Numbers Disappeared in an Array
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[[4,3,2,7,8,2,3,1]]', '[5,6]', true, 0 from public.problems p where p.slug='find-all-numbers-disappeared-in-an-array';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[[1,1]]', '[2]', false, 1 from public.problems p where p.slug='find-all-numbers-disappeared-in-an-array';

-- Maximum Number of Balloons
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["nlaebolko"]', '1', true, 0 from public.problems p where p.slug='maximum-number-of-balloons';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["loonbalxballpoon"]', '2', false, 1 from public.problems p where p.slug='maximum-number-of-balloons';

-- Number of Good Pairs
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[[1,2,3,1,1,3]]', '4', true, 0 from public.problems p where p.slug='number-of-good-pairs';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[[1,1,1,1]]', '6', false, 1 from public.problems p where p.slug='number-of-good-pairs';

-- Isomorphic Strings
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["egg","add"]', 'true', true, 0 from public.problems p where p.slug='isomorphic-strings';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["foo","bar"]', 'false', false, 1 from public.problems p where p.slug='isomorphic-strings';

-- Ransom Note
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["a","b"]', 'false', true, 0 from public.problems p where p.slug='ransom-note';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["aa","aab"]', 'true', false, 1 from public.problems p where p.slug='ransom-note';

-- Contains Duplicate II
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[[1,2,3,1],3]', 'true', true, 0 from public.problems p where p.slug='contains-duplicate-ii';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[[1,2,3,1,2,3],2]', 'false', false, 1 from public.problems p where p.slug='contains-duplicate-ii';

-- Intersection of Two Arrays II
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[[1,2,2,1],[2,2]]', '[2,2]', true, 0 from public.problems p where p.slug='intersection-of-two-arrays-ii';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[[4,9,5],[9,4,9,8,4]]', '[4,9]', false, 1 from public.problems p where p.slug='intersection-of-two-arrays-ii';

-- Reorganize String
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["aab"]', '"aba"', true, 0 from public.problems p where p.slug='reorganize-string';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["aaab"]', '""', false, 1 from public.problems p where p.slug='reorganize-string';

-- Longest Consecutive Sequence
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[[100,4,200,1,3,2]]', '4', true, 0 from public.problems p where p.slug='longest-consecutive-sequence';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[[0,3,7,2,5,8,4,6,0,1]]', '9', false, 1 from public.problems p where p.slug='longest-consecutive-sequence';

-- Split Array into Consecutive Subsequences
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[[1,2,3,3,4,5]]', 'true', true, 0 from public.problems p where p.slug='split-array-into-consecutive-subsequences';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[[1,2,3,4,4,5]]', 'false', false, 1 from public.problems p where p.slug='split-array-into-consecutive-subsequences';

-- Number of Matching Subsequences
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["abcde",["a","bb","acd","ace"]]', '3', true, 0 from public.problems p where p.slug='number-of-matching-subsequences';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["dsahjpjauf",["ahjpjau","ja","ahbwzgqnuk","tnmlanowax"]]', '2', false, 1 from public.problems p where p.slug='number-of-matching-subsequences';

-- Number of Good Ways to Split a String
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["aacaba"]', '2', true, 0 from public.problems p where p.slug='number-of-good-ways-to-split-a-string';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["abcd"]', '1', false, 1 from public.problems p where p.slug='number-of-good-ways-to-split-a-string';

-- Minimum Deletions to Make Character Frequencies Unique
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["aab"]', '0', true, 0 from public.problems p where p.slug='minimum-deletions-to-make-character-frequencies-unique';
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '["aaabbbcc"]', '2', false, 1 from public.problems p where p.slug='minimum-deletions-to-make-character-frequencies-unique';
