# Change Logs

- 2026/09/17 - 0.4.0
  - Now empirical-cases is the new name.
  - Featue: Support vitest, jest, mocha and any framework that provides similar test function.
  - Chore: Rewrite using TypeScript.
  - NPM: Remove dependencies.

- 2026/01/28 - 0.3.1
  - NPM: Bump version for npm publish.

- 2019/02/22 - 0.3.0
  - Feature: Allow escaping the brace characters `{` and `}` with `\\`.
  - Feature: Allow entries of `cases` be an object.

- 2018/01/23 - 0.2.1
  - Feature: Accept function for test name
  - Feature: Add default pass through runner

- 2018/01/14 - 0.2.0
  - NPM: Bump version, update readme and publish to npm.js.

- 2017/12/07 - 0.1.11
  - Feature: New format for adding test cases.

- 2016/01/08 - 0.1.10
  - Feature: Allow `error` to be an `Error` instance, a class or a normal value.
  - Feature: Allow test case negate `errback` option that enabled by overall options.

- 2016/01/07 - 0.1.9
  - Feature: Deprecate the `async` option. For sync/async runner that returning value, i.e. primitive value, promise, stream or observable, you don't have to add any option. For async runner that use errback (callback), you need to add `errback` option.

- 2016/01/06 - 0.1.8
  - Feature: Replace `chai-as-promised` with `async-done`. Now async runner can use callback or return promise, stream or observable.

- 2015/12/24 - 0.1.6
  - NPM: Update npm settings.

- 2015/12/16 - 0.1.5
  - Bug Fix: Fix error when expected values array contains falsy value.

- 2015/12/07 - 0.1.4
  - NPM: Move mocha from "dependencies" to "peerDependencies".

- 2015/12/03 - 0.1.3
  - Feature: Allow multiple values in one case using "values" keyword.

- 2015/12/03 - 0.1.1
  - Feature: Make runner optional, or can be defined either in global options or case options.
  - Feature: Allow value interpolation in test name.

- 2015/11/23 - 0.1.0
  - First release.
