import { apiGithub } from './api-github';

describe('apiGithub', () => {
  it('should work', () => {
    expect(apiGithub()).toEqual('api-github');
  });
});
