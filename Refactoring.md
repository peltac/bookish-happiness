# Refactoring

You've been asked to refactor the function `deterministicPartitionKey` in [`dpk.js`](dpk.js) to make it easier to read and understand without changing its functionality. For this task, you should:

1. Write unit tests to cover the existing functionality and ensure that your refactor doesn't break it. We typically use `jest`, but if you have another library you prefer, feel free to use it.
2. Refactor the function to be as "clean" and "readable" as possible. There are many valid ways to define those words - use your own personal definitions, but be prepared to defend them. Note that we do like to use the latest JS language features when applicable.
3. Write up a brief (~1 paragraph) explanation of why you made the choices you did and why specifically your version is more "readable" than the original.

You will be graded on the exhaustiveness and quality of your unit tests, the depth of your refactor, and the level of insight into your thought process provided by the written explanation.

## Your Explanation Here

**CONTRARIAN ANSWER:** The function is fine the way it is.

The function is simple enough for me to understand and test during a timed coding interview. That already makes it a decent-ish piece of code.

Some arguments for not changing the code:

 * I have added unit tests that function as documentation to show how the function works.
 * The function is pure--without side effects. This means that it can be understood in isolation without having to understand the surrounding codebase.
 * Functions for hashing and partitioning tend to be optimized for performance and portability--not for readability. Go read any implementation of SHA-3 and tell me otherwise.
 * This is a timed coding interview and I ran out of time. I spent most of my time on the Ticket Breakdown task.

What the function does need:
 * Comments and docstrings. It's not clear how to use the function, or what context it should be used in.
 * Type hints. It's not clear what `event` should be.
 * A design document. It's not clear why anybody would partition anything with the given function implementation.
 