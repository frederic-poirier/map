/* @refresh reload */
import { render } from 'solid-js/web'
import './index.css'
import App from './App.jsx'
import { registerSheetElements } from 'pure-web-bottom-sheet'

const root = document.getElementById('root')
registerSheetElements()
render(() => <App />, root)
