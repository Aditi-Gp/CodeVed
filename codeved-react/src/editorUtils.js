const pairs = { "{": "}", "[": "]", "(": ")", '"': '"', "'": "'" };

export function handleCodeKeyDown(event, code, setCode) {
  const input = event.currentTarget;
  const start = input.selectionStart;
  const end = input.selectionEnd;

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