import React, { useEffect } from "react";
// import { useHistory } from "react-router-dom";
import useGame from "../core/gametest";

const GamePage = () => {
  //   const history = useHistory();
  const forceUpdate: () => void = React.useState({})[1].bind(null, {});
  const {
    gameStatus,
    levelBlocksVal,
    randomBlocksVal,
    slotAreaVal,
    widthUnit,
    heightUnit,
    totalBlockNum,
    clearBlockNum,
    isHolyLight,
    canSeeRandom,
    doClickBlock,
    doStart,
    doShuffle,
    doBroke,
    doRemove,
    doRevert,
    doHolyLight,
    doSeeRandom,
  } = useGame();
  console.log(
    "levelBlocksVallevelBlocksVal",
    gameStatus,
    levelBlocksVal,
    randomBlocksVal,
    slotAreaVal,
    widthUnit,
    heightUnit,
    totalBlockNum,
    clearBlockNum,
    isHolyLight,
    canSeeRandom
  );

  // useEffect(() => {
  //   console.log("forceUpdateforceUpdateforceUpdate");

  //   forceUpdate();
  // }, [
  //   gameStatus,
  //   levelBlocksVal,
  //   randomBlocksVal,
  //   slotAreaVal,
  //   widthUnit,
  //   heightUnit,
  //   totalBlockNum,
  //   clearBlockNum,
  //   isHolyLight,
  //   canSeeRandom,
  // ]);
  // Back button handler
  const doBack = () => {
    // history.goBack();
  };
  // ComponentDidMount equivalent using useEffect
  useEffect(() => {
    doStart();
    forceUpdate();
  }, []);

  return (
    <div className="content">
      <div id="gamePage">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <button onClick={doBack}>Back</button>
          <button>
            Block: {clearBlockNum} / {totalBlockNum}
          </button>
        </div>

        {gameStatus === 3 && (
          <div style={{ textAlign: "center" }}>
            <h2>恭喜，你赢啦！🎉</h2>
            <img alt="" src="../assets/kunkun.png" />
          </div>
        )}

        <div
          className="level-board"
          style={{ display: gameStatus > 0 ? "block" : "none" }}
        >
          {levelBlocksVal.map((block: any, idx: any) => (
            <div
              key={idx}
              style={{
                position: "absolute",
                zIndex: 100 + block.level,
                left: block.x * widthUnit + "px",
                top: block.y * heightUnit + "px",
              }}
            >
              {block.status === 0 && (
                <div
                  className={`block level-block ${
                    !isHolyLight &&
                    block.lowerThanBlocks.length > 0 &&
                    "disabled"
                  }`}
                  data-id={block.id}
                  onClick={() => doClickBlock(block)}
                >
                  {block.type}
                </div>
              )}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "8px",
          }}
          className="random-board"
        >
          {randomBlocksVal.map((randomBlock: any, index: any) => (
            <div key={index} className="random-area">
              {randomBlock.length > 0 && (
                <div
                  data-id={randomBlock[0]?.id}
                  className="block"
                  onClick={() => doClickBlock(randomBlock[0], index)}
                >
                  {randomBlock[0]?.type}
                </div>
              )}

              {Array.from({ length: Math.max(randomBlock.length - 1, 0) }).map(
                (_, num) => (
                  <div key={num} className="block disabled">
                    {canSeeRandom && <span>{randomBlock[num].type}</span>}
                  </div>
                )
              )}
            </div>
          ))}
        </div>

        {slotAreaVal.length > 0 && (
          <div style={{ textAlign: "center" }} className="slot-board">
            {slotAreaVal.map((slotBlock: any, index: any) => (
              <div key={index} className="block">
                {slotBlock?.type}
              </div>
            ))}
          </div>
        )}

        <div className="skill-board" style={{ textAlign: "center" }}>
          <button onClick={doRevert}>Revert</button>
          <button onClick={doRemove}>Remove</button>
          <button onClick={doShuffle}>Shuffle</button>
          <button onClick={doBroke}>Broke</button>
          <button onClick={doSeeRandom}>Random</button>
        </div>
      </div>
    </div>
  );
};

export default GamePage;

// Add your CSS styles here (no need for scoped styles in React)
