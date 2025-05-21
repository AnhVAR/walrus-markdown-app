import React, { useState, useEffect } from 'react';

interface MarkdownInputProps {
  onChange: (markdown: string) => void;
  defaultValue?: string;
}

const MarkdownInput: React.FC<MarkdownInputProps> = ({ onChange, defaultValue = '' }) => {
  const [inputValue, setInputValue] = useState(defaultValue);

  useEffect(() => {
    setInputValue(defaultValue);
    onChange(defaultValue);
  }, [defaultValue]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setInputValue(value);
    onChange(value);
  };

  return (
    <div style={{ height: '100%' }}>
      <textarea
        value={inputValue}
        onChange={handleChange}
        placeholder="Enter your markdown here..."
        rows={10}
        style={{
          width: '100%',
          height: '100%',
          fontSize: '16px',
          border: 'none',
          outline: 'none',
          resize: 'none',
          background: 'transparent',
          padding: 16,
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
};

export default MarkdownInput;