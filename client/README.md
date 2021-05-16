# Project_Emily Client

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

# Mitt event docs

### close-modal
---
When the ModalBase has finished all its animations, `"close-modal"` will be emitted.

### start-close-modal
---
Call from any modals in the ModalBase slot. This will start the transitions before finally closing the modal.
