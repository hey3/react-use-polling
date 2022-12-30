# react-use-polling

![ci](https://github.com/hey3/react-use-polling/actions/workflows/test.yml/badge.svg)
![npm version](https://badge.fury.io/js/react-use-polling.svg)
![license](https://badgen.net/npm/license/react-use-polling)

`react-use-polling` is a react hooks library for polling asynchronous processes.

## Instration

```bash
npm install react-use-polling
```

## Quikstart

```tsx
import { useState } from 'react'
import { usePolling } from 'react-use-polling'

function App() {
  const [count, setCount] = useState<number>(0)

  const updateCountAsync = async () => {
    await new Promise(r => setTimeout(r, 100))
    setCount(c => c + 1)
  }

  const { pause } = usePolling(updateCountAsync, 1000)

  return (
    <div>
      <span>{count}</span>
      <button onClick={() => pause()}>Pause Polling</button>
    </div>
  )
}
```

## Hooks

### `usePolling`

This hook uses `requestAnimationFrame`.  
It stops processing in the background to improving performance and reducing battery consumption.

### `usePollingForce`

This hook uses `setInterval`.  
This will continue the polling process even in the background.

## License

[MIT License](https://github.com/hey3/react-use-polling/blob/main/LICENSE)

## Author

Kohei Oyama ([@hey3](https://github.com/hey3))
