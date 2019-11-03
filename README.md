# s2p-quick-plot
## Quickly plot an s2p file.
This tool is an electron app. It allows the user to plot an s2p touchstone file. The file can be dragged onto the app window. The s-parameters, VSWR and stability factor will be plotted. 
You can view the help page [Here](https://poormantronics.com/quickplot-help.html)
## Installation
1. Dowload or clone the repository.
2. Add electron and electron-builder modules:
```
yarn add electron electron-builder --dev
```
3. Add the mathjs module:
```
yarn add mathjs
```
## Usage
```
yarn start
```
## Notes
The electron builder will build a windows app.
