import React, { useState, useRef } from "react";
import { Stage, Layer, Line, Text, Rect } from "react-konva";

type Element = {
    type: "line" | "text";
    points?: number[];
    text?: string;
    x?: number;
    y?: number;
    id: string;
};

const GRID_SIZE = 20;
const SNAP_DISTANCE = 10;
const FIELD_WIDTH = 1000;
const FIELD_HEIGHT = 800;

const Editor = () => {
    const [elements, setElements] = useState<Element[]>([]);
    const [mode, setMode] = useState<"draw" | "text" | "delete">("draw");
    const [currentLine, setCurrentLine] = useState<number[] | null>(null);
    const [snapToGrid, setSnapToGrid] = useState(true);
    const stageRef = useRef(null);

    const snapPoint = (x: number, y: number): [number, number] => {
        if (!snapToGrid) return [x, y];

        const snappedX = Math.round(x / GRID_SIZE) * GRID_SIZE;
        const snappedY = Math.round(y / GRID_SIZE) * GRID_SIZE;

        const distance = Math.sqrt((x - snappedX) ** 2 + (y - snappedY) ** 2);
        return distance <= SNAP_DISTANCE ? [snappedX, snappedY] : [x, y];
    };

    const handleMouseDown = (e: any) => {
        if (mode !== "draw") return;

        const pos = e.target.getStage().getPointerPosition();
        const [x, y] = snapPoint(pos.x, pos.y);
        setCurrentLine([x, y, x, y]);
    };

    const handleMouseMove = (e: any) => {
        if (mode !== "draw" || !currentLine) return;

        const pos = e.target.getStage().getPointerPosition();
        const [x, y] = snapPoint(pos.x, pos.y);
        setCurrentLine([currentLine[0], currentLine[1], x, y]);
    };

    const handleMouseUp = () => {
        if (mode !== "draw" || !currentLine) return;

        setElements([...elements, { type: "line", points: currentLine, id: Math.random().toString() }]);
        setCurrentLine(null);
    };

    const handleAddText = (e: any) => {
        if (mode !== "text") return;

        const pos = e.target.getStage().getPointerPosition();
        const [x, y] = snapPoint(pos.x, pos.y);
        const text = prompt("Введите текст:");
        if (text) {
            setElements([...elements, { type: "text", text, x, y, id: Math.random().toString() }]);
        }
    };

    const handleDelete = (e: any) => {
        if (mode !== "delete") return;

        const clickedId = e.target.id();
        setElements(elements.filter((el) => el.id !== clickedId));
    };

    const renderGrid = () => {
        const width = FIELD_WIDTH;
        const height = FIELD_HEIGHT;
        const gridLines = [];

        for (let x = 0; x <= width; x += GRID_SIZE) {
            gridLines.push(<Line key={`v_${x}`} points={[x, 0, x, height]} stroke="#ddd" strokeWidth={1} />);
        }

        for (let y = 0; y <= height; y += GRID_SIZE) {
            gridLines.push(<Line key={`h_${y}`} points={[0, y, width, y]} stroke="#ddd" strokeWidth={1} />);
        }

        return gridLines;
    };

    const handleStart = (e: any) => {
        e.evt.preventDefault();
        if (mode !== "draw") return;
        const pos = getPointerPosition(e);
        setCurrentLine([pos.x, pos.y, pos.x, pos.y]);
    };

    const handleMove = (e: any) => {
        if (mode !== "draw" || !currentLine) return;
        const pos = getPointerPosition(e);
        setCurrentLine([currentLine[0], currentLine[1], pos.x, pos.y]);
    };

    const getPointerPosition = (e: any) => {
        const stage = e.target.getStage();
        return stage.getPointerPosition();
    };

    const handleEnd = () => {
        if (!currentLine) return;
        setElements([...elements, {
            type: "line",
            points: currentLine,
            id: Math.random().toString()
        }]);
        setCurrentLine(null);
    };

    return (
        <div>
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
            />
            <div style={{ display: 'flex', marginBottom: 10, gap: 10, alignItems: 'center' }}>
                <button onClick={() => setMode("draw")}>Рисовать линию</button>
                <button onClick={() => setMode("text")}>Добавить текст</button>
                <button onClick={() => setMode("delete")}>Удалить</button>
                <button onClick={() => setElements([])}>Очистить поле</button>
                <label>
                    <input
                        type="checkbox"
                        checked={snapToGrid}
                        onChange={(e) => setSnapToGrid(e.target.checked)}
                    />
                    Привязка к сетке
                </label>
            </div>
            <Stage
                ref={stageRef}
                width={FIELD_WIDTH}
                height={FIELD_HEIGHT}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
                onClick={mode === "text" ? handleAddText : mode === "delete" ? handleDelete : undefined}
                style={{
                    touchAction: 'none'
                }}
            >
                <Layer>
                    <Rect width={FIELD_WIDTH} height={FIELD_HEIGHT} fill="white" />
                    {renderGrid()}

                    {elements.map((el) => {
                        if (el.type === "line") {
                            return (
                                <Line
                                    onMouseEnter={(e) => {
                                        if (mode === "delete") {
                                            // @ts-ignore
                                            e.target?.stroke("red");
                                            // @ts-ignore
                                            e.target?.strokeWidth(4);
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (mode === "delete") {
                                            // @ts-ignore
                                            e.target?.stroke("black");
                                            // @ts-ignore
                                            e.target?.strokeWidth(2);
                                        }
                                    }}
                                    key={el.id}
                                    hitStrokeWidth={4}
                                    id={el.id}
                                    points={el.points}
                                    stroke="black"
                                    strokeWidth={2}
                                />
                            )
                        } else if (el.type === "text") {
                            return (
                                <Text
                                    fontStyle="normal"
                                    key={el.id}
                                    id={el.id}
                                    x={el.x}
                                    y={el.y}
                                    text={el.text}
                                    fontSize={16}
                                    fill="black"
                                    onClick={mode === "delete" ? handleDelete : undefined}
                                    onMouseEnter={(e) => {
                                        if (mode === "delete") {
                                            // @ts-ignore
                                            e.target.fill("red");
                                            // @ts-ignore
                                            e.target?.fontStyle("bold")
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (mode === "delete") {
                                            // @ts-ignore
                                            e.target.fill("black");
                                            // @ts-ignore
                                            e.target?.fontStyle("normal")
                                        }
                                    }}
                                />
                            )
                        }
                        return null;
                    })}

                    {currentLine && <Line points={currentLine} stroke="black" strokeWidth={2} />}
                </Layer>
            </Stage>
        </div>
    );
};

export default Editor;