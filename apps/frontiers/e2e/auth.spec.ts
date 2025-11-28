import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('should show auth modal for unauthenticated users', async ({ page }) => {
        // Visit home page
        await page.goto('/');

        // Should show auth modal
        await expect(page.getByRole('dialog')).toBeVisible();
        await expect(page.getByText('Welcome back')).toBeVisible();
    });

    test('should allow switching between sign in and sign up', async ({ page }) => {
        await page.goto('/');

        // Default to sign in
        await expect(page.getByText('Welcome back')).toBeVisible();

        // Switch to sign up
        await page.getByRole('button', { name: /sign up/i }).click();
        await expect(page.getByText('Create your account')).toBeVisible();

        // Switch back to sign in
        await page.getByRole('button', { name: /sign in/i }).click();
        await expect(page.getByText('Welcome back')).toBeVisible();
    });
});

test.describe('Navigation', () => {
    test('should not show navbar on home page', async ({ page }) => {
        // This test would need authenticated state - skipped for now
        test.skip();
    });
});
