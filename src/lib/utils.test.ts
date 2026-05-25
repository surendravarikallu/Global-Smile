import { cn } from './utils';

describe('cn utility function', () => {
  test('should merge class names correctly', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    expect(result).toContain('text-red-500');
    expect(result).toContain('bg-blue-500');
  });

  test('should override Tailwind classes correctly when there is a conflict', () => {
    const result = cn('p-4', 'p-6');
    expect(result).toBe('p-6');
  });

  test('should handle conditional classes correctly', () => {
    const isActive = true;
    const isPending = false;
    const result = cn(
      'base-class',
      isActive && 'active-class',
      isPending && 'pending-class'
    );
    expect(result).toContain('base-class');
    expect(result).toContain('active-class');
    expect(result).not.toContain('pending-class');
  });

  test('should filter out falsy values', () => {
    const result = cn('class-a', null, undefined, false, 'class-b');
    expect(result).toBe('class-a class-b');
  });
});
