# Interactive World
This repo was developed for an interactive 3D world development showcase on a website like the interactive design on the Github homepage.
![Drag Racing](ref/img.web.preview.png)
- View [Demo](https://maxolib.github.io/world/) here!!
  > Signals in the demo were generated randomly
## Background Knowledge
- HTML and CSS
- Typescript
- Threejs library
- Computer graphic rendering
- Mathematics for computer graphic
- OpenGL Shader

## Installation
1. Download [Node.js](https://nodejs.org/en/download/) and install `Node.js`.
2. Run the command below in your terminal.
    ``` bash
    # Install dependencies
    npm install
    
    # init and update submodules
    git submodule update --init --recursive
    ```
## Development
1. Open terminal and the command below for runing the local server at `localhost:8080`
    ``` bash
    npm run dev
    ```

1. Open new terminal and run the command below for update typescript automatically
    ``` bash
    npx tsc -w
    ```
## Build
- Build
    Run the command below in your terminal
    ``` bash
    # Build for production in the dist/ directory
    npm run build
    ```
## Credits
Thanks to:
- [Bruno Simon](https://bruno-simon.com/) - For [three.js Journey](https://threejs-journey.xyz/) course
- [GreenSock (Gsap)](https://greensock.com/) - For JavaScript animation
- [Github](https://github.com/) - Interactive design for development showcase.
