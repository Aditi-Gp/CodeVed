import Prism from 'prismjs';

// Load base and required languages manually in correct order
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-cpp';

// Optional: log to verify language was registered
console.log('Loaded Prism languages:', Object.keys(Prism.languages));

export default Prism;
