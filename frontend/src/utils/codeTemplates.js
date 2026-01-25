/**
 * Code templates for different programming languages
 * Used to initialize editor with language-specific boilerplate
 */

export const codeTemplates = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}`,

  java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int a = scanner.nextInt();
        int b = scanner.nextInt();
        System.out.println(a + b);
        scanner.close();
    }
}`,

  python: `# Read input
a, b = map(int, input().split())

# Calculate and print result
print(a + b)`,
};

/**
 * Get language display name
 */
export function getLanguageName(lang) {
  const names = {
    cpp: 'C++',
    java: 'Java',
    python: 'Python',
  };
  return names[lang] || lang.toUpperCase();
}

/**
 * Get Prism.js language identifier for syntax highlighting
 */
export function getPrismLanguage(lang) {
  const mapping = {
    cpp: 'cpp',
    java: 'java',
    python: 'python',
  };
  return mapping[lang] || 'text';
}










