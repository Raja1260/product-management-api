# Interview Questions — Quick Reference

Questions only (no answers). Use this to test yourself.
Answers are in DOC_INTERVIEW.md.

---

## Architecture

1. What is the MVC pattern? How is it used in this project?
2. What is the Repository Pattern? Why is it used?
3. What is the Service Layer? What does it contain?
4. Why should controllers stay thin?
5. What is the Single Responsibility Principle?
6. What happens if you put business logic inside a controller?
7. Why does the repository not contain business logic?
8. What is the flow of a request from client to database?

---

## Error Handling

9. What is ApiError and why is it better than plain `new Error()`?
10. What is asyncHandler? Why is it needed?
11. What is a global error middleware? How does Express know it is one?
12. Why must the error middleware be registered last in app.js?
13. What is the standard response format used in this API?
14. What is ApiResponse used for?

---

## Validation

15. What is Zod? How is it different from Mongoose validation?
16. Why validate with both Zod and Mongoose?
17. What does `.parse()` do in Zod?
18. What does `.partial()` do on a Zod schema?
19. Where in the request lifecycle does validation happen?

---

## Pagination

20. What is pagination? Why is it important?
21. What is `skip()` in MongoDB?
22. What is `limit()` in MongoDB?
23. Explain the formula: `skip = (page - 1) * limit`
24. Give an example: page=3, limit=5. What is skip?
25. Why do we use `countDocuments()` instead of `.length`?
26. Why is `Math.ceil()` used for totalPages?
27. What is the difference between `req.query` and `req.params`?
28. Why must `countDocuments` receive the same filter as `find()`?

---

## Search

29. What is MongoDB `$regex`?
30. What does `$options: "i"` mean?
31. How do you make a search case-insensitive in MongoDB?
32. What SQL keyword is `$regex` similar to?

---

## Filtering

33. What does `$gte` mean in MongoDB?
34. What does `$lte` mean in MongoDB?
35. How do you filter products between a price range in MongoDB?
36. How does the dynamic filter object work?
37. What happens if no filter parameters are sent?

---

## Sorting

38. How does `?sort=-price` work?
39. What does `-1` mean in a MongoDB sort object?
40. Why do we whitelist allowed sort fields?
41. What is the default sort order in this API?
42. How do you build a dynamic sort object in JavaScript?

---

## JWT Authentication

43. What is a JWT? What are its three parts?
44. What does the auth middleware do step by step?
45. What is `jwt.verify()` and what does it return?
46. What is bcrypt? Why is it used for passwords?
47. What is a salt round (cost factor) in bcrypt?
48. What does `bcrypt.compare()` do?
49. What should and should NOT be put in a JWT payload?
50. Why is the error message "Invalid email or password" rather than separate messages?
51. What does `select("-password")` do in Mongoose?
52. What is `req.user`? Who sets it?

---

## RBAC

53. What is the difference between authentication and authorization?
54. What is the difference between 401 and 403?
55. How does the `authorize()` middleware work?
56. Why must `auth` run before `authorize`?
57. What is Role-Based Access Control?
58. How do you make an admin user in this project?
59. Why do you need to log in again after changing a role in MongoDB?

---

## Refresh Tokens

60. What is the problem with a single long-lived JWT?
61. What is the two-token solution?
62. What is an access token? What is its expiry in this project?
63. What is a refresh token? What is its expiry in this project?
64. What is an httpOnly cookie? Why is it more secure than localStorage?
65. What is XSS? How does httpOnly prevent refresh token theft?
66. What is token rotation?
67. Why is the refresh token hash stored, not the raw token?
68. Why use a separate `JWT_REFRESH_SECRET`?
69. What does `select: false` do on a Mongoose field?
70. What happens server-side during logout?
71. What is CORS `credentials: true`? Why is it needed?
72. How do you read a cookie in Express?
73. What is `cookie-parser`? Where is it registered?
74. What error is returned if the refresh token is missing?
75. What error is returned if the refresh token was already rotated?

---

## General

76. What is the difference between `req.body`, `req.query`, and `req.params`?
77. What is middleware in Express?
78. What does `next()` do? What does `next(error)` do?
79. Why use environment variables instead of hardcoded values?
80. What does `timestamps: true` do in Mongoose?
81. Why separate `server.js` and `app.js`?
82. What is `process.exit(1)` and when is it used?
83. What is Mongoose? How is it different from the raw MongoDB driver?
84. What does `unique: true` do on a Mongoose field?
85. What is a Mongoose schema?
