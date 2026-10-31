const pairs = { "{": "}", "[": "]", "(": ")", '"': '"', "'": "'" };

export function handleCodeKeyDown(event, code, setCode, language = "") {
  const input = event.currentTarget;
  const start = input.selectionStart;
  const end = input.selectionEnd;

  if (language === "cpp" && event.ctrlKey && event.key === "\\") {
    event.preventDefault();
    const lineStart = code.lastIndexOf("\n", start - 1) + 1;
    const selectionEnd = end === start ? code.indexOf("\n", start) : end;
    const blockEnd = selectionEnd === -1 ? code.length : selectionEnd;
    const lines = code.slice(lineStart, blockEnd).split("\n");
    const uncomment = lines.every((line) => /^\s*\/\//.test(line) || !line.trim());
    const nextLines = lines.map((line) => {
      if (uncomment) return line.replace(/^(\s*)\/\/\s?/, "$1");
      return line.trim() ? line.replace(/^(\s*)/, "$1// ") : line;
    });
    const replacement = nextLines.join("\n");
    setCode(`${code.slice(0, lineStart)}${replacement}${code.slice(blockEnd)}`);
    return;
  }

  if (event.key === "Tab") {
    event.preventDefault();
    const nextCode = `${code.slice(0, start)}    ${code.slice(end)}`;
    setCode(nextCode);
    requestAnimationFrame(() => {
      input.selectionStart = start + 4;
      input.selectionEnd = start + 4;
    });
    return;
  }

  const closing = pairs[event.key];
  if (closing) {
    event.preventDefault();
    const selected = code.slice(start, end);
    const nextCode = `${code.slice(0, start)}${event.key}${selected}${closing}${code.slice(end)}`;
    setCode(nextCode);
    requestAnimationFrame(() => {
      input.selectionStart = start + 1;
      input.selectionEnd = end + 1;
    });
    return;
  }

  if (event.key === "Enter" && start === end) {
    const lineStart = code.lastIndexOf("\n", start - 1) + 1;
    const indentation = code.slice(lineStart, start).match(/^\s*/)?.[0] || "";
    const previousCharacter = code[start - 1];
    const extraIndent = ["{", "[", "(", ":"].includes(previousCharacter) ? "    " : "";
    event.preventDefault();
    const insertion = `\n${indentation}${extraIndent}`;
    setCode(`${code.slice(0, start)}${insertion}${code.slice(end)}`);
    requestAnimationFrame(() => {
      const cursor = start + insertion.length;
      input.selectionStart = cursor;
      input.selectionEnd = cursor;
    });
  }
}