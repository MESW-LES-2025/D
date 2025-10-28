import { describe, expect, it } from 'vitest';
import { convertImageToBase64 } from '@/utils/file';

describe('convertImageToBase64', () => {
  it('should convert a File to base64 string', async () => {
    const fileContent = 'test image content';
    const file = new File([fileContent], 'test.png', { type: 'image/png' });

    const result = await convertImageToBase64(file);

    expect(result).toContain('data:image/png;base64,');
    expect(typeof result).toBe('string');
  });

  it('should handle different image types', async () => {
    const file = new File(['jpeg content'], 'photo.jpg', { type: 'image/jpeg' });

    const result = await convertImageToBase64(file);

    expect(result).toContain('data:image/jpeg;base64,');
  });

  it('should convert PNG image', async () => {
    const file = new File(['png content'], 'image.png', { type: 'image/png' });

    const result = await convertImageToBase64(file);

    expect(result).toContain('data:image/png;base64,');
  });

  it('should convert WebP image', async () => {
    const file = new File(['webp content'], 'image.webp', { type: 'image/webp' });

    const result = await convertImageToBase64(file);

    expect(result).toContain('data:image/webp;base64,');
  });

  it('should handle empty file', async () => {
    const file = new File([], 'empty.png', { type: 'image/png' });

    const result = await convertImageToBase64(file);

    expect(result).toContain('data:image/png;base64,');
    expect(typeof result).toBe('string');
  });

  it('should preserve file type in base64 string', async () => {
    const svgFile = new File(['<svg></svg>'], 'icon.svg', { type: 'image/svg+xml' });

    const result = await convertImageToBase64(svgFile);

    expect(result).toContain('data:image/svg+xml;base64,');
  });
});
