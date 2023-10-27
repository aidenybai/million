'use client'

import { useState, useEffect, useContext, createContext } from "react"
import {usePartySocket} from "partysocket/react"

interface Position {
    x: number,
    y: number,
    pointer: "mouse" | "touch",
}

type Cursor = Position & {
    country: string | null,
    lastUpdate: number,
}

type OtherCursorsMap = Record<string, Cursor>

interface CursorsContextType {
    others: OtherCursorsMap
    self: Position | null
}

export const CursorsContext = createContext<CursorsContextType>({ others: {}, self: null })

export function useCursors() {
    return useContext(CursorsContext)
}

export default function CursorsContextProvider(props : { host: string; room: string, children: React.ReactNode }) {
    const [self, setSelf] = useState<Position | null>(null)
    const [dimensions, setDimensions] = useState<{ width: number, height: number }>({ width: 0, height: 0 })

    const socket = usePartySocket({
            host: "localhost:1999",
            room: props.room
    })
    const [others, setOthers] = useState<OtherCursorsMap>({})

    useEffect(() => {
        if (socket) {
            const onMessage = (evt: WebSocketEventMap['message']) => {
                const msg = JSON.parse(evt.data as string);
                switch(msg.type) {
                    case "sync":
                        const newOthers = { ...msg.cursors }
                        setOthers(newOthers)
                        break;
                    case "update":
                        const other = { x: msg.x, y: msg.y, country: msg.country, lastUpdate: msg.lastUpdate, pointer: msg.pointer }
                        setOthers((others) => ({ ...others, [msg.id]: other }))
                        break;
                    case "remove":
                        setOthers((others) => {
                            const newOthers = { ...others }
                            delete newOthers[msg.id]
                            return newOthers
                        })
                        break;
                }
            }
            socket.addEventListener("message", onMessage)

            return () => {
                // @ts-expect-error
                socket.removeEventListener("message", onMessage)
            }
        }
    }, [socket])

    // Track window dimensions
    useEffect(() => {
        const onResize = () => {
            setDimensions({ width: document.body.clientWidth, height: document.body.clientHeight })
        }
        window.addEventListener('resize', onResize)
        onResize()
        return () => {
            window.removeEventListener('resize', onResize)
        }
    }, [])

    // Always track the mouse position
    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if(!socket) return
            if(!dimensions.width || !dimensions.height) return
            const position = { x: e.pageX / dimensions.width, y: e.pageY / dimensions.height, pointer: "mouse" } as Position
            socket.send(JSON.stringify(position))
            setSelf(position)
        }
        window.addEventListener('mousemove', onMouseMove)
        const scrollPosition = [window.scrollX, window.scrollY]
        window.addEventListener('scroll', e => {

        })

        // Also listen for touch events
        const onTouchMove = (e: TouchEvent) => {
            if(!socket) return
            if(!dimensions.width || !dimensions.height) return
            e.preventDefault()
            const position = { x: e.touches[0].pageX / dimensions.width, y: e.touches[0].pageY / dimensions.height, pointer: "touch" } as Position
            socket.send(JSON.stringify(position))
            setSelf(position)
        }
        window.addEventListener('touchmove', onTouchMove)

        // Catch the end of touch events
        const onTouchEnd = (e: TouchEvent) => {
            if(!socket) return
            socket.send(JSON.stringify({}))
            setSelf(null)
        }
        window.addEventListener('touchend', onTouchEnd)

        return () => {
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('touchmove', onTouchMove)
            window.removeEventListener('touchend', onTouchEnd)
        }
    }, [socket, dimensions])

    return (
        <CursorsContext.Provider value={{ others, self }}>
            {props.children}
        </CursorsContext.Provider>
    )
}