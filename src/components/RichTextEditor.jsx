import React, { useState, useRef, useEffect } from 'react'
import './RichTextEditor.css'

export default function RichTextEditor({ value, onChange, placeholder, maxLength }) {
  const [selectedText, setSelectedText] = useState('')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const editorRef = useRef(null)
  const colorPickerRef = useRef(null)

  const colors = [
    '#e2e8f0', // Default light gray
    '#ffffff', // White
    '#0ea5e9', // Blue (brand color)
    '#10b981', // Green
    '#f59e0b', // Yellow/Gold
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#84cc16', // Lime
  ]

  useEffect(() => {
    function handleClickOutside(event) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setShowColorPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSelectionChange = () => {
    const selection = window.getSelection()
    setSelectedText(selection.toString())
  }

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value)
    editorRef.current.focus()
    handleContentChange()
  }

  const handleContentChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML
      // Convert HTML to a format we can store/display
      onChange(content)
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  const getCharacterCount = () => {
    if (editorRef.current) {
      return editorRef.current.textContent.length || 0
    }
    return 0
  }

  const applyFontSize = (size) => {
    const selection = window.getSelection()
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      if (!range.collapsed) {
        const span = document.createElement('span')
        span.style.fontSize = size
        range.surroundContents(span)
        selection.removeAllRanges()
        handleContentChange()
      }
    }
  }

  const applyColor = (color) => {
    execCommand('foreColor', color)
    setShowColorPicker(false)
  }

  return (
    <div className="rich-text-editor">
      {/* Toolbar */}
      <div className="editor-toolbar">
        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => applyFontSize('12px')}
            title="Small Text"
          >
            <span style={{ fontSize: '12px' }}>S</span>
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => applyFontSize('14px')}
            title="Normal Text"
          >
            <span style={{ fontSize: '14px' }}>M</span>
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => applyFontSize('16px')}
            title="Large Text"
          >
            <span style={{ fontSize: '16px' }}>L</span>
          </button>
        </div>

        <div className="toolbar-separator"></div>

        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => execCommand('bold')}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => execCommand('underline')}
            title="Underline"
          >
            <u>U</u>
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => execCommand('italic')}
            title="Italic"
          >
            <em>I</em>
          </button>
        </div>

        <div className="toolbar-separator"></div>

        <div className="toolbar-group">
          <div className="color-picker-wrapper" ref={colorPickerRef}>
            <button
              type="button"
              className="toolbar-btn color-btn"
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Text Color"
            >
              <span className="color-icon">A</span>
            </button>
            {showColorPicker && (
              <div className="color-picker">
                {colors.map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    className="color-option"
                    style={{ backgroundColor: color }}
                    onClick={() => applyColor(color)}
                    title={`Color: ${color}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        className="rich-editor-content"
        contentEditable
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={handleContentChange}
        onMouseUp={handleSelectionChange}
        onKeyUp={handleSelectionChange}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      {/* Character Count */}
      <div className="character-count">
        {getCharacterCount()}/{maxLength} characters
      </div>
    </div>
  )
}