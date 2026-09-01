-- ============================================================
-- CODE BATTLE - SAMPLE Seed (starter problems)
-- A tiny demo set so fresh installs have something to play with.
-- The FULL catalog lives in db/seed.sql (git-ignored, generated
-- from the live database). Idempotent: safe to re-run.
-- ============================================================

insert into public.cb_problems (slug, title, description, difficulty, category, constraints, starter_code, function_name)
select $s$two-sum$s$, $s$Two Sum$s$, $s$Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.$s$, $s$easy$s$, $s$Two Pointers$s$, $s$2 <= nums.length <= 10^4; -10^9 <= nums[i] <= 10^9; -10^9 <= target <= 10^9$s$, $s$function twoSum(nums, target) {\n  // Return an array of two indices [i, j]\n}$s$, $s$twoSum$s$
where not exists (select 1 from public.cb_problems q where q.slug = $s$two-sum$s$);

-- Two Sum
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$[[2,7,11,15],9]$s$, $s$[0,1]$s$, true, 0 from public.cb_problems p where p.slug = $s$two-sum$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$[[3,2,4],6]$s$, $s$[1,2]$s$, true, 1 from public.cb_problems p where p.slug = $s$two-sum$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$[[3,3],6]$s$, $s$[0,1]$s$, false, 2 from public.cb_problems p where p.slug = $s$two-sum$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$[[1,2,3,4,5],9]$s$, $s$[3,4]$s$, false, 3 from public.cb_problems p where p.slug = $s$two-sum$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$[[-1,-2,-3,-4,-5],-8]$s$, $s$[2,4]$s$, false, 4 from public.cb_problems p where p.slug = $s$two-sum$s$;

insert into public.cb_problems (slug, title, description, difficulty, category, constraints, starter_code, function_name)
select $s$valid-parentheses$s$, $s$Valid Parentheses$s$, $s$Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if open brackets must be closed by the same type of brackets and in the correct order.$s$, $s$easy$s$, $s$ArrayStacks$s$, $s$1 <= s.length <= 10^4$s$, $s$function isValid(s) {\n  // Return true if the string has valid parentheses\n}$s$, $s$isValid$s$
where not exists (select 1 from public.cb_problems q where q.slug = $s$valid-parentheses$s$);

-- Valid Parentheses
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$"()"$s$, $s$true$s$, true, 0 from public.cb_problems p where p.slug = $s$valid-parentheses$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$"()[]{}"$s$, $s$true$s$, true, 1 from public.cb_problems p where p.slug = $s$valid-parentheses$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$"(]"$s$, $s$false$s$, false, 2 from public.cb_problems p where p.slug = $s$valid-parentheses$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$"([)]"$s$, $s$false$s$, false, 3 from public.cb_problems p where p.slug = $s$valid-parentheses$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$"{[]}"$s$, $s$true$s$, false, 4 from public.cb_problems p where p.slug = $s$valid-parentheses$s$;

insert into public.cb_problems (slug, title, description, difficulty, category, constraints, starter_code, function_name)
select $s$reverse-string$s$, $s$Reverse String$s$, $s$Write a function that reverses a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory.$s$, $s$easy$s$, $s$String$s$, $s$1 <= s.length <= 10^5, s[i] is a printable ASCII character.$s$, $s$function reverseString(s) {
  //
}$s$, $s$reverseString$s$
where not exists (select 1 from public.cb_problems q where q.slug = $s$reverse-string$s$);

-- Reverse String
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$[["h","e","l","l","o"]]$s$, $s$["o","l","l","e","h"]$s$, true, 0 from public.cb_problems p where p.slug = $s$reverse-string$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$[["H","a","n","n","a","h"]]$s$, $s$["h","a","n","n","a","H"]$s$, true, 1 from public.cb_problems p where p.slug = $s$reverse-string$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$[["a"]]$s$, $s$["a"]$s$, false, 2 from public.cb_problems p where p.slug = $s$reverse-string$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$[["a","b"]]$s$, $s$["b","a"]$s$, false, 3 from public.cb_problems p where p.slug = $s$reverse-string$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$[["a","b","c","d"]]$s$, $s$["d","c","b","a"]$s$, false, 4 from public.cb_problems p where p.slug = $s$reverse-string$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$[["1","2","3","4","5"]]$s$, $s$["5","4","3","2","1"]$s$, false, 5 from public.cb_problems p where p.slug = $s$reverse-string$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$[["!","@","#","$","%"]]$s$, $s$["%","$","#","@","!"]$s$, false, 6 from public.cb_problems p where p.slug = $s$reverse-string$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$[["a","a","b","b","a"]]$s$, $s$["a","b","b","a","a"]$s$, false, 7 from public.cb_problems p where p.slug = $s$reverse-string$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$[["A","b","C","d","E"]]$s$, $s$["E","d","C","b","A"]$s$, false, 8 from public.cb_problems p where p.slug = $s$reverse-string$s$;

insert into public.cb_problems (slug, title, description, difficulty, category, constraints, starter_code, function_name)
select $s$merge-sorted-array$s$, $s$Merge Sorted Array$s$, $s$Given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n representing the number of elements in nums1 and nums2 respectively, merge nums2 into nums1 so that nums1 becomes sorted in non-decreasing order. The first m elements of nums1 are valid values and the last n elements are empty space represented by 0.$s$, $s$easy$s$, $s$Two Pointers$s$, $s$nums1.length == m + n, nums2.length == n, 0 <= m, n <= 200, 1 <= m + n <= 200, -10^9 <= nums1[i], nums2[j] <= 10^9$s$, $s$function merge(nums1, m, nums2, n) {
  //
}$s$, $s$merge$s$
where not exists (select 1 from public.cb_problems q where q.slug = $s$merge-sorted-array$s$);

-- Merge Sorted Array
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$[[1,2,3,0,0,0],3,[2,5,6],3]$s$, $s$[1,2,2,3,5,6]$s$, true, 0 from public.cb_problems p where p.slug = $s$merge-sorted-array$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$[[1],1,[],0]$s$, $s$[1]$s$, true, 1 from public.cb_problems p where p.slug = $s$merge-sorted-array$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$[[0],0,[1],1]$s$, $s$[1]$s$, true, 2 from public.cb_problems p where p.slug = $s$merge-sorted-array$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$[[1,0],1,[2],1]$s$, $s$[1,2]$s$, false, 3 from public.cb_problems p where p.slug = $s$merge-sorted-array$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$[[0,0,0],0,[1,2,3],3]$s$, $s$[1,2,3]$s$, false, 4 from public.cb_problems p where p.slug = $s$merge-sorted-array$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$[[1,2,3,0,0,0],3,[4,5,6],3]$s$, $s$[1,2,3,4,5,6]$s$, false, 5 from public.cb_problems p where p.slug = $s$merge-sorted-array$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$[[4,5,6,0,0,0],3,[1,2,3],3]$s$, $s$[1,2,3,4,5,6]$s$, false, 6 from public.cb_problems p where p.slug = $s$merge-sorted-array$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$[[1,1,1,0,0,0],3,[1,1,1],3]$s$, $s$[1,1,1,1,1,1]$s$, false, 7 from public.cb_problems p where p.slug = $s$merge-sorted-array$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$[[-5,-3,-1,0,0],3,[-4,-2],2]$s$, $s$[-5,-4,-3,-2,-1]$s$, false, 8 from public.cb_problems p where p.slug = $s$merge-sorted-array$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$[[-10,0,10,0,0,0],3,[-20,-10,5],3]$s$, $s$[-20,-10,-10,0,5,10]$s$, false, 9 from public.cb_problems p where p.slug = $s$merge-sorted-array$s$;

insert into public.cb_problems (slug, title, description, difficulty, category, constraints, starter_code, function_name)
select $s$maximum-subarray$s$, $s$Maximum Subarray$s$, $s$Given an integer array nums, find the subarray with the largest sum, and return its sum. A subarray is a contiguous non-empty sequence of elements within an array.$s$, $s$medium$s$, $s$Array$s$, $s$1 <= nums.length <= 10^5; -10^4 <= nums[i] <= 10^4$s$, $s$function maxSubArray(nums) {
  // Return the sum of the subarray with the largest sum
}$s$, $s$maxSubArray$s$
where not exists (select 1 from public.cb_problems q where q.slug = $s$maximum-subarray$s$);

-- Maximum Subarray
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$[[-2,1,-3,4,-1,2,1,-5,4]]$s$, $s$6$s$, true, 0 from public.cb_problems p where p.slug = $s$maximum-subarray$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$1$s$, $s$1$s$, true, 1 from public.cb_problems p where p.slug = $s$maximum-subarray$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$[[5,4,-1,7,8]]$s$, $s$23$s$, true, 2 from public.cb_problems p where p.slug = $s$maximum-subarray$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$-1$s$, $s$-1$s$, false, 3 from public.cb_problems p where p.slug = $s$maximum-subarray$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$[[-2,-1]]$s$, $s$-1$s$, false, 4 from public.cb_problems p where p.slug = $s$maximum-subarray$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$[[2,-1,2]]$s$, $s$3$s$, false, 5 from public.cb_problems p where p.slug = $s$maximum-subarray$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$[[0,0,0]]$s$, $s$0$s$, false, 6 from public.cb_problems p where p.slug = $s$maximum-subarray$s$;

insert into public.cb_problems (slug, title, description, difficulty, category, constraints, starter_code, function_name)
select $s$longest-substring-without-repeating-characters$s$, $s$Longest Substring Without Repeating Characters$s$, $s$Given a string s, find the length of the longest substring without duplicate characters.$s$, $s$medium$s$, $s$String$s$, $s$0 <= s.length <= 5 * 10^4; s consists of English letters, digits, symbols and spaces$s$, $s$function lengthOfLongestSubstring(s) {
  // Return the length of the longest substring without repeating characters
}$s$, $s$lengthOfLongestSubstring$s$
where not exists (select 1 from public.cb_problems q where q.slug = $s$longest-substring-without-repeating-characters$s$);

-- Longest Substring Without Repeating Characters
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$["abcabcbb"]$s$, $s$3$s$, true, 0 from public.cb_problems p where p.slug = $s$longest-substring-without-repeating-characters$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$["bbbbb"]$s$, $s$1$s$, true, 1 from public.cb_problems p where p.slug = $s$longest-substring-without-repeating-characters$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$["pwwkew"]$s$, $s$3$s$, true, 2 from public.cb_problems p where p.slug = $s$longest-substring-without-repeating-characters$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$["a"]$s$, $s$1$s$, false, 3 from public.cb_problems p where p.slug = $s$longest-substring-without-repeating-characters$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$[""]$s$, $s$0$s$, false, 4 from public.cb_problems p where p.slug = $s$longest-substring-without-repeating-characters$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$["dvdf"]$s$, $s$3$s$, false, 5 from public.cb_problems p where p.slug = $s$longest-substring-without-repeating-characters$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$["abba"]$s$, $s$2$s$, false, 6 from public.cb_problems p where p.slug = $s$longest-substring-without-repeating-characters$s$;
insert into public.cb_problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, $s$[" "]$s$, $s$1$s$, false, 7 from public.cb_problems p where p.slug = $s$longest-substring-without-repeating-characters$s$;

