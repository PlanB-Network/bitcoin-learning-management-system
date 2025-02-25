/// <reference types="mocha" />

import assert from 'node:assert';
import { UserRole } from '@blms/constants';
import { canAccess } from './auth.js';

describe('Shared hasRole function', () => {
  it('should be able to check an object without role property', () => {
    assert.equal(false, canAccess(UserRole.Student)({} as any));
  });

  it('should be able to check an object with invalid role property', () => {
    const user = { role: 'Invalid' } as any;
    assert.equal(false, canAccess(UserRole.Student)(user));
  });

  it('should be able to check an object with valid role property', () => {
    const student = { role: UserRole.Student };
    assert.equal(true, canAccess(UserRole.Student)(student));
    assert.equal(false, canAccess(UserRole.Professor)(student));

    const community = { role: UserRole.Community };
    assert.equal(true, canAccess(UserRole.Community)(community));
    assert.equal(false, canAccess(UserRole.Admin)(community));
  });

  it('superadmin can access everything', () => {
    const superadmin = { role: UserRole.Superadmin };
    assert.equal(true, canAccess(UserRole.Student)(superadmin));
    assert.equal(true, canAccess(UserRole.Community)(superadmin));
    assert.equal(true, canAccess(UserRole.Professor)(superadmin));
    assert.equal(true, canAccess(UserRole.Admin)(superadmin));
    assert.equal(true, canAccess(UserRole.Superadmin)(superadmin));
  });

  it('admin can access everything except superadmin', () => {
    const admin = { role: UserRole.Admin };
    assert.equal(true, canAccess(UserRole.Student)(admin));
    assert.equal(true, canAccess(UserRole.Community)(admin));
    assert.equal(true, canAccess(UserRole.Professor)(admin));
    assert.equal(true, canAccess(UserRole.Admin)(admin));
    assert.equal(false, canAccess(UserRole.Superadmin)(admin));
  });

  it('other roles can only access their own resources', () => {
    const student = { role: UserRole.Student };
    assert.equal(true, canAccess(UserRole.Student)(student));
    assert.equal(false, canAccess(UserRole.Community)(student));
    assert.equal(false, canAccess(UserRole.Professor)(student));
    assert.equal(false, canAccess(UserRole.Admin)(student));
    assert.equal(false, canAccess(UserRole.Superadmin)(student));

    const community = { role: UserRole.Community };
    assert.equal(false, canAccess(UserRole.Student)(community));
    assert.equal(true, canAccess(UserRole.Community)(community));
    assert.equal(false, canAccess(UserRole.Professor)(community));
    assert.equal(false, canAccess(UserRole.Admin)(community));
    assert.equal(false, canAccess(UserRole.Superadmin)(community));

    const professor = { role: UserRole.Professor };
    assert.equal(false, canAccess(UserRole.Student)(professor));
    assert.equal(false, canAccess(UserRole.Community)(professor));
    assert.equal(true, canAccess(UserRole.Professor)(professor));
    assert.equal(false, canAccess(UserRole.Admin)(professor));
    assert.equal(false, canAccess(UserRole.Superadmin)(professor));
  });
});
