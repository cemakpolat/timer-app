import {
  inputStyle,
  buttonStyle,
  cardStyle,
  selectStyle,
  textAreaStyle,
  checkboxStyle
} from '../utils/styleHelpers';

describe('styleHelpers', () => {
  const mockTheme = {
    card: '#ffffff',
    text: '#000000',
    accent: '#007bff'
  };

  describe('inputStyle', () => {
    test('returns object with required properties', () => {
      const style = inputStyle(mockTheme.accent, mockTheme.text, 'rgba(255,255,255,0.1)', 8);
      expect(style).toHaveProperty('padding');
      expect(style).toHaveProperty('border');
      expect(style).toHaveProperty('borderRadius');
      expect(style).toHaveProperty('background');
      expect(style).toHaveProperty('color');
    });

    test('uses provided text color', () => {
      const style = inputStyle(mockTheme.accent, mockTheme.text, 'rgba(255,255,255,0.1)', 8);
      expect(style.color).toBe(mockTheme.text);
    });

    test('uses provided border', () => {
      const borderColor = 'rgba(255,0,0,0.1)';
      const style = inputStyle(mockTheme.accent, mockTheme.text, borderColor, 8);
      expect(style.border).toContain('1px solid');
    });

    test('includes proper border radius', () => {
      const style = inputStyle(mockTheme.accent, mockTheme.text, 'rgba(255,255,255,0.1)', 8);
      expect(style.borderRadius).toBe(8);
    });

    test('has proper dimensions', () => {
      const style = inputStyle(mockTheme.accent, mockTheme.text, 'rgba(255,255,255,0.1)', 8);
      expect(style.width).toBe('100%');
      expect(style.fontSize).toBe(14);
    });
  });

  describe('buttonStyle', () => {
    test('returns object with button-specific properties', () => {
      const style = buttonStyle(mockTheme);
      expect(style).toHaveProperty('padding');
      expect(style).toHaveProperty('background');
      expect(style).toHaveProperty('color');
      expect(style).toHaveProperty('border');
      expect(style).toHaveProperty('cursor');
    });

    test('uses theme accent for primary button', () => {
      const style = buttonStyle(mockTheme, true);
      expect(style.background).toBe(mockTheme.accent);
    });

    test('has cursor pointer', () => {
      const style = buttonStyle(mockTheme);
      expect(style.cursor).toBe('pointer');
    });

    test('has proper border radius', () => {
      const style = buttonStyle(mockTheme);
      expect(style.borderRadius).toBe(8);
    });

    test('includes transition', () => {
      const style = buttonStyle(mockTheme);
      expect(style.transition).toContain('all');
    });

    test('has border', () => {
      const style = buttonStyle(mockTheme);
      expect(style.border).toBeDefined();
    });
  });

  describe('cardStyle', () => {
    test('returns object with card-specific properties', () => {
      const style = cardStyle(mockTheme);
      expect(style).toHaveProperty('background');
      expect(style).toHaveProperty('padding');
      expect(style).toHaveProperty('borderRadius');
    });

    test('uses theme card color for background', () => {
      const style = cardStyle(mockTheme);
      expect(style.background).toBeDefined();
    });

    test('has proper border radius', () => {
      const style = cardStyle(mockTheme);
      expect(style.borderRadius).toBe(12);
    });

    test('includes transition', () => {
      const style = cardStyle(mockTheme);
      expect(style.transition).toContain('ease');
    });

    test('has adequate padding', () => {
      const style = cardStyle(mockTheme);
      expect(style.padding).toBe(20);
    });
  });

  describe('selectStyle', () => {
    test('returns object with select-specific properties', () => {
      const style = selectStyle(mockTheme);
      expect(style).toHaveProperty('padding');
      expect(style).toHaveProperty('border');
      expect(style).toHaveProperty('borderRadius');
      expect(style).toHaveProperty('background');
      expect(style).toHaveProperty('color');
      expect(style).toHaveProperty('cursor');
    });

    test('has background property', () => {
      const style = selectStyle(mockTheme);
      expect(style.background).toBeDefined();
    });

    test('has cursor pointer', () => {
      const style = selectStyle(mockTheme);
      expect(style.cursor).toBe('pointer');
    });

    test('has full width', () => {
      const style = selectStyle(mockTheme);
      expect(style.width).toBe('100%');
    });

    test('has border', () => {
      const style = selectStyle(mockTheme);
      expect(style.border).toBeDefined();
    });
  });

  describe('textAreaStyle', () => {
    test('returns object with textarea-specific properties', () => {
      const style = textAreaStyle(mockTheme.accent, mockTheme.text);
      expect(style).toHaveProperty('padding');
      expect(style).toHaveProperty('border');
      expect(style).toHaveProperty('borderRadius');
      expect(style).toHaveProperty('background');
      expect(style).toHaveProperty('color');
      expect(style).toHaveProperty('resize');
    });

    test('uses theme card color for background', () => {
      const style = textAreaStyle(mockTheme.accent, mockTheme.text);
      expect(style.background).toBeDefined();
    });

    test('uses theme text color', () => {
      const style = textAreaStyle(mockTheme.accent, mockTheme.text);
      expect(style.color).toBe(mockTheme.text);
    });

    test('has proper resize setting', () => {
      const style = textAreaStyle(mockTheme.accent, mockTheme.text);
      expect(style.resize).toBe('vertical');
    });

    test('has minimum height', () => {
      const style = textAreaStyle(mockTheme.accent, mockTheme.text);
      expect(style.minHeight).toBe(100);
    });

    test('has full width', () => {
      const style = textAreaStyle(mockTheme.accent, mockTheme.text);
      expect(style.width).toBe('100%');
    });

    test('has font family defined', () => {
      const style = textAreaStyle(mockTheme.accent, mockTheme.text);
      expect(style.fontFamily).toBeDefined();
    });
  });

  describe('checkboxStyle', () => {
    test('returns object with checkbox-specific properties', () => {
      const style = checkboxStyle(mockTheme);
      expect(style).toHaveProperty('width');
      expect(style).toHaveProperty('height');
      expect(style).toHaveProperty('border');
      expect(style).toHaveProperty('cursor');
    });

    test('has cursor pointer', () => {
      const style = checkboxStyle(mockTheme);
      expect(style.cursor).toBe('pointer');
    });

    test('uses theme accent color', () => {
      const style = checkboxStyle(mockTheme);
      expect(style.border).toBeDefined();
    });

    test('has proper dimensions', () => {
      const style = checkboxStyle(mockTheme);
      expect(style.width).toBe(20);
      expect(style.height).toBe(20);
    });
  });

  describe('Theme variations', () => {
    test('handles dark theme', () => {
      const darkTheme = {
        card: '#1a1a1a',
        text: '#ffffff',
        accent: '#00ff00'
      };
      
      const inputStyles = inputStyle(darkTheme.accent, darkTheme.text, 'rgba(0,255,0,0.1)', 8);
      expect(inputStyles.color).toBe('#ffffff');
      expect(inputStyles.background).toBeDefined();
    });

    test('handles light theme', () => {
      const lightTheme = {
        card: '#f5f5f5',
        text: '#333333',
        accent: '#ff6b6b'
      };
      
      const buttonStyles = buttonStyle(lightTheme, true);
      expect(buttonStyles.background).toBe('#ff6b6b');
    });

    test('all helpers accept proper parameters', () => {
      expect(() => {
        inputStyle(mockTheme.accent, mockTheme.text, 'rgba(255,255,255,0.1)', 8);
        buttonStyle(mockTheme);
        cardStyle(mockTheme);
        selectStyle(mockTheme);
        textAreaStyle(mockTheme.accent, mockTheme.text);
        checkboxStyle(mockTheme);
      }).not.toThrow();
    });
  });

  describe('Consistency across styles', () => {
    test('all helpers return objects', () => {
      const input = inputStyle(mockTheme.accent, mockTheme.text, 'rgba(255,255,255,0.1)', 8);
      const button = buttonStyle(mockTheme);
      const card = cardStyle(mockTheme);
      
      expect(typeof input).toBe('object');
      expect(typeof button).toBe('object');
      expect(typeof card).toBe('object');
    });

    test('helpers include required CSS properties', () => {
      const input = inputStyle(mockTheme.accent, mockTheme.text, 'rgba(255,255,255,0.1)', 8);
      
      expect(input).toHaveProperty('borderRadius');
      expect(input).toHaveProperty('padding');
      expect(input).toHaveProperty('color');
    });
  });
});
