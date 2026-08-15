-- ============================================================
-- CODE BATTLE — Seed problems + test cases
-- Run after schema.sql and functions.sql.
-- ============================================================

insert into public.problems (slug, title, description, difficulty, category, constraints, starter_code, function_name) values
('two-sum', 'Two Sum',
 'Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
 'easy', 'Hash Maps',
 '2 <= nums.length <= 10^4; -10^9 <= nums[i] <= 10^9; -10^9 <= target <= 10^9',
 'function twoSum(nums, target) {\n  // Return an array of two indices [i, j]\n}',
 'twoSum'),
('valid-parentheses', 'Valid Parentheses',
 'Given a string s containing just the characters ''('', '')'', ''{'', ''}'', ''['' and '']'', determine if the input string is valid. An input string is valid if open brackets must be closed by the same type of brackets and in the correct order.',
 'easy', 'Stack',
 '1 <= s.length <= 10^4',
 'function isValid(s) {\n  // Return true if the string has valid parentheses\n}',
 'isValid')
on conflict (slug) do nothing;

-- Two Sum test cases
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[[2,7,11,15],9]', '[0,1]', true, 0 from public.problems p where p.slug='two-sum'
on conflict do nothing;
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[[3,2,4],6]', '[1,2]', true, 1 from public.problems p where p.slug='two-sum'
on conflict do nothing;
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[[3,3],6]', '[0,1]', false, 2 from public.problems p where p.slug='two-sum'
on conflict do nothing;
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[[1,2,3,4,5],9]', '[3,4]', false, 3 from public.problems p where p.slug='two-sum'
on conflict do nothing;
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '[[-1,-2,-3,-4,-5],-8]', '[2,4]', false, 4 from public.problems p where p.slug='two-sum'
on conflict do nothing;

-- Valid Parentheses test cases
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '"()"', 'true', true, 0 from public.problems p where p.slug='valid-parentheses'
on conflict do nothing;
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '"()[]{}"', 'true', true, 1 from public.problems p where p.slug='valid-parentheses'
on conflict do nothing;
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '"(]"', 'false', false, 2 from public.problems p where p.slug='valid-parentheses'
on conflict do nothing;
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '"([)]"', 'false', false, 3 from public.problems p where p.slug='valid-parentheses'
on conflict do nothing;
insert into public.problem_test_cases (problem_id, input, expected_output, is_sample, sort_order)
select p.id, '"{[]}"', 'true', false, 4 from public.problems p where p.slug='valid-parentheses'
on conflict do nothing;
