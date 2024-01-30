import React, { useEffect } from "react";
// import { useHistory } from "react-router-dom";
import useGame from "../core/game";

const GamePage = () => {
  //   const history = useHistory();
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

  // Back button handler
  const doBack = () => {
    // history.goBack();
  };
  console.log("gameStatus", gameStatus);

  // ComponentDidMount equivalent using useEffect
  useEffect(() => {
    console.log("doStartdoStartdoStartdoStart");
    doStart();
  }, []);
  console.log("randomBlocksVal", randomBlocksVal);

  return (
    <div id="gamePage">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
        <button onClick={doBack}>返回</button>
        <button>
          块数：{clearBlockNum} / {totalBlockNum}
        </button>
      </div>

      {gameStatus === 3 && (
        <div style={{ textAlign: "center" }}>
          <h2>恭喜，你赢啦！🎉</h2>
          <img alt="程序员鱼皮" src="../assets/kunkun.png" />
        </div>
      )}

      {gameStatus >= 0 && (
        <div className="level-board">
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
      )}

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
        <button onClick={doRevert}>撤回</button>
        <button onClick={doRemove}>移出</button>
        <button onClick={doShuffle}>洗牌</button>
        <button onClick={doBroke}>破坏</button>
        <button onClick={doHolyLight}>圣光</button>
        <button onClick={doSeeRandom}>透视</button>
      </div>
    </div>
  );
};

export default GamePage;

// Add your CSS styles here (no need for scoped styles in React)
