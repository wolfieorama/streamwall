import { ipcRenderer } from 'electron'
import { h, Fragment, render } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { State } from 'xstate'
import styled from 'styled-components'
import Mousetrap from 'mousetrap'
import { TailSpin } from 'svg-loaders-react'

import './index.css'
import { WIDTH, HEIGHT } from '../constants'

import InstagramIcon from './static/instagram.svg'
import FacebookIcon from './static/facebook.svg'
import PeriscopeIcon from './static/periscope.svg'
import TwitchIcon from './static/twitch.svg'
import YouTubeIcon from './static/youtube.svg'
import SoundIcon from './static/volume-up-solid.svg'

Mousetrap.bind('ctrl+shift+i', () => {
  ipcRenderer.send('devtools-overlay')
})

function Overlay({ spaces, streamData }) {
  const activeSpaces = spaces.filter((s) => s.matches('displaying'))
  return (
    <div>
      {activeSpaces.map((spaceState) => {
        const { url, bounds } = spaceState.context
        const data = streamData.find((d) => url === d.Link)
        const isListening = spaceState.matches('displaying.running.listening')
        const isLoading = spaceState.matches('displaying.loading')
        return (
          <SpaceBorder bounds={bounds} isListening={isListening}>
            {data && (
              <>
                <StreamTitle>
                  <StreamIcon url={url} />
                  {data.Source} &ndash; {data.City} {data.State}
                </StreamTitle>
              </>
            )}
            {isLoading && <LoadingSpinner />}
            {isListening && <ListeningIndicator />}
          </SpaceBorder>
        )
      })}
    </div>
  )
}

function App() {
  const [spaces, setSpaces] = useState([])
  const [streamData, setStreamData] = useState([])

  useEffect(() => {
    const spaceStateMap = new Map()
    ipcRenderer.on('space-state', (ev, idx, { state, context }) => {
      spaceStateMap.set(idx, State.from(state, context))
      setSpaces([...spaceStateMap.values()])
    })
    ipcRenderer.on('stream-data', (ev, data) => {
      setStreamData(data)
    })
  }, [])

  return <Overlay spaces={spaces} streamData={streamData} />
}

function StreamIcon({ url, ...props }) {
  let parsedURL
  try {
    parsedURL = new URL(url)
  } catch {
    return null
  }

  let { host } = parsedURL
  host = host.replace(/^www\./, '')
  if (host === 'youtube.com' || host === 'youtu.be') {
    return <YouTubeIcon {...props} />
  } else if (host === 'facebook.com' || host === 'm.facebook.com') {
    return <FacebookIcon {...props} />
  } else if (host === 'twitch.tv') {
    return <TwitchIcon {...props} />
  } else if (host === 'periscope.tv' || host === 'pscp.tv') {
    return <PeriscopeIcon {...props} />
  } else if (host === 'instagram.com') {
    return <InstagramIcon {...props} />
  }
  return null
}

const SpaceBorder = styled.div.attrs((props) => ({
  borderWidth: 2,
}))`
  position: fixed;
  left: ${({ bounds }) => bounds.x}px;
  top: ${({ bounds }) => bounds.y}px;
  width: ${({ bounds }) => bounds.width}px;
  height: ${({ bounds }) => bounds.height}px;
  border: 0 solid black;
  border-left-width: ${({ bounds, borderWidth }) =>
    bounds.x === 0 ? 0 : borderWidth}px;
  border-right-width: ${({ bounds, borderWidth }) =>
    bounds.x + bounds.width === WIDTH ? 0 : borderWidth}px;
  border-top-width: ${({ bounds, borderWidth }) =>
    bounds.y === 0 ? 0 : borderWidth}px;
  border-bottom-width: ${({ bounds, borderWidth }) =>
    bounds.y + bounds.height === HEIGHT ? 0 : borderWidth}px;
  box-shadow: ${({ isListening }) =>
    isListening ? '0 0 10px red inset' : 'none'};
  box-sizing: border-box;
  pointer-events: none;
`

const StreamTitle = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  margin: 5px;
  font-weight: 600;
  font-size: 20px;
  color: white;
  text-shadow: 0 0 4px black;
  letter-spacing: -0.025em;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  backdrop-filter: blur(10px);

  svg {
    width: 1.25em;
    height: 1.25em;
    margin-right: 0.35em;
    overflow: visible;
    filter: drop-shadow(0 0 4px black);

    path {
      fill: white;
    }
  }
`

const LoadingSpinner = styled(TailSpin)`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  opacity: 0.5;
`

const ListeningIndicator = styled(SoundIcon)`
  position: absolute;
  right: 15px;
  bottom: 10px;
  width: 30px;
  height: 30px;
  opacity: 0.9;

  path {
    fill: red;
  }
`

render(<App />, document.body)
