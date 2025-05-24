# AlgoU Online Compiler with user input

A modern, web-based C++ compiler and code execution platform built with React and Node.js. This application allows users to write, compile, and execute C++ code directly in their browser with real-time syntax highlighting and user input support.

![AlgoU Online Compiler](https://github.com/bhavesh1129/AlgoU-Online-Compiler-2/blob/main/frontend/Snapshot.png)

## 🚀 Features

- **Real-time Code Editor**: Monaco-style code editor with C++ syntax highlighting
- **Instant Compilation**: Compile and execute C++ code with a single click
- **Input Support**: Provide custom input to your programs
- **Error Handling**: Clear error messages for compilation and runtime errors
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Beautiful, intuitive interface built with Tailwind CSS

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern JavaScript framework
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **PrismJS** - Syntax highlighting library
- **Axios** - HTTP client for API requests

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **GCC** - GNU Compiler Collection for C++
- **UUID** - Unique identifier generation
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 14 or higher)
- **npm** or **yarn** package manager
- **GCC compiler** (for C++ compilation)
  - On Ubuntu/Debian: `sudo apt install gcc g++`
  - On macOS: Install Xcode Command Line Tools
  - On Windows: Install MinGW or Visual Studio

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/bhavesh1129/AlgoU-Online-Compiler-2.git
cd AlgoU-Online-Compiler-2
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 4. Start the Backend Server
```bash
cd ../backend
npm start
# or for development with auto-restart:
npm run dev
```
The backend server will start on `http://localhost:8000`

### 5. Start the Frontend Development Server
```bash
cd ../frontend
npm run dev
```
The frontend will be available at `http://localhost:5173`

## 💻 Usage

1. **Write Code**: Enter your C++ code in the editor on the left side
2. **Provide Input** (optional): Add any input your program needs in the input textarea
3. **Run Code**: Click the "Run" button to compile and execute your code
4. **View Output**: See the program output (or error messages) in the output section

### Example C++ Program
```cpp
#include <iostream>
using namespace std;

int main() {
    int num1, num2, sum;
    
    // Input two numbers
    cin >> num1 >> num2;
    
    // Calculate sum
    sum = num1 + num2;
    
    // Output result
    cout << "The sum is: " << sum << endl;
    
    return 0;
}
```

**Sample Input:**
```
5 10
```

**Expected Output:**
```
The sum is: 15
```

## 🏗️ Project Structure

```
AlgoU-Online-Compiler-2/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── App.jsx          # Main React component
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── package.json         # Frontend dependencies
│   └── vite.config.js       # Vite configuration
├── backend/                 # Node.js backend server
│   ├── index.js            # Main server file
│   ├── generateFile.js     # Code file generation
│   ├── generateInputFile.js # Input file generation
│   ├── executeCpp.js       # C++ compilation and execution
│   └── package.json        # Backend dependencies
└── README.md               # Project documentation
```

## 🔧 Configuration

### Environment Variables (Frontend)
Create a `.env` file in the frontend directory (optional):
```env
VITE_BACKEND_URL=http://localhost:8000/run
```

### Server Port (Backend)
The backend server uses port 8000 by default. You can change this by setting the `PORT` environment variable:
```bash
PORT=3001 npm start
```

## 🚀 Production Deployment

### Backend Deployment
```bash
cd backend
npm start
```

### Frontend Build
```bash
cd frontend
npm run build
```

The built files will be in the `frontend/dist` directory, ready for deployment to any static hosting service.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
