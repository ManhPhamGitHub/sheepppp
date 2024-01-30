import React, { useState, useEffect, useRef } from "react";
import _ from "lodash";
import { useGlobalStore } from "./globalStore";

const useGame = () => {
  const gameStatus = useRef<any>(0);
  const levelBlocksVal = useRef<any>([]);
  const randomBlocksVal = useRef<any>([]);
  const slotAreaVal = useRef<any>([]);
  const currSlotNum = useRef<any>(0);
  const totalBlockNum = useRef<any>(0);
  const clearBlockNum = useRef<any>(0);
  const isHolyLight = useRef<any>(false);
  const canSeeRandom = useRef<any>(false);

  const boxWidthNum = 24;
  const boxHeightNum = 24;

  // 每个格子的宽高
  const widthUnit = 14;
  const heightUnit = 14;
  let chessBoard: ChessBoardUnitType[][] = [];
  const allBlocks: BlockType[] = [];
  const blockData: Record<number, BlockType> = {};
  // 操作历史（存储点击的块）
  let opHistory: BlockType[] = [];
  const {
    state: { gameConfig },
  } = useGlobalStore();

  const initChessBoard = (width: number, height: number) => {
    chessBoard = new Array(width);
    for (let i = 0; i < width; i++) {
      chessBoard[i] = new Array(height);
      for (let j = 0; j < height; j++) {
        chessBoard[i][j] = {
          blocks: [],
        };
      }
    }
  };

  // 初始化棋盘
  initChessBoard(boxWidthNum, boxHeightNum);

  // useEffect(() => {
  //   // Initialization logic
  //   console.log("initGame", gameConfig);

  //   // ... (rest of the code)
  // }, [gameConfig]);

  const initGame = () => {
    console.log("initGame", gameConfig);

    // 0. 设置父容器宽高
    const levelBoardDom: any = document.getElementsByClassName("level-board");
    levelBoardDom[0].style.width = widthUnit * boxWidthNum + "px";
    levelBoardDom[0].style.height = heightUnit * boxHeightNum + "px";

    // 1. 规划块数
    // 块数单位（总块数必须是该值的倍数）
    const blockNumUnit = gameConfig.composeNum * gameConfig.typeNum;
    console.log("blockNumUnit", blockNumUnit);

    // 随机生成的总块数
    const totalRandomBlockNum = gameConfig.randomBlocks.reduce(
      (pre: number, curr: number) => {
        return pre + curr;
      },
      0
    );
    console.log("totalRandomBlockNum", totalRandomBlockNum);

    // 需要的最小块数
    const minBlockNum =
      gameConfig.levelNum * gameConfig.levelBlockNum + totalRandomBlockNum;
    console.log("minBlockNum", minBlockNum);

    // 补齐到 blockNumUnit 的倍数
    // e.g. minBlockNum = 14, blockNumUnit = 6, 补到 18
    totalBlockNum.current = minBlockNum;
    if (totalBlockNum.current % blockNumUnit !== 0) {
      totalBlockNum.current =
        (Math.floor(minBlockNum / blockNumUnit) + 1) * blockNumUnit;
    }
    console.log("totalBlockNum", totalBlockNum.current);

    // 2. 初始化块，随机生成块的内容
    // 保存所有块的数组
    const animalBlocks: string[] = [];
    // 需要用到的动物数组
    const needAnimals = gameConfig.animals.slice(0, gameConfig.typeNum);
    // 依次把块塞到数组里
    for (let i = 0; i < totalBlockNum.current; i++) {
      animalBlocks.push(needAnimals[i % gameConfig.typeNum]);
    }
    // 打乱数组
    const randomAnimalBlocks = _.shuffle(animalBlocks);

    // 初始化
    for (let i = 0; i < totalBlockNum.current; i++) {
      const newBlock = {
        id: i,
        status: 0,
        level: 0,
        type: randomAnimalBlocks[i],
        higherThanBlocks: [] as BlockType[],
        lowerThanBlocks: [] as BlockType[],
      } as BlockType;
      allBlocks.push(newBlock);
    }

    // 下一个要塞入的块
    let pos = 0;

    // 3. 计算随机生成的块
    const randomBlocks: BlockType[][] = [];
    gameConfig.randomBlocks.forEach((randomBlock: number, idx: number) => {
      randomBlocks[idx] = [];
      for (let i = 0; i < randomBlock; i++) {
        randomBlocks[idx].push(allBlocks[pos]);
        blockData[pos] = allBlocks[pos];
        pos++;
      }
    });

    // 剩余块数
    let leftBlockNum = totalBlockNum.current - totalRandomBlockNum;

    // 4. 计算有层级关系的块
    const levelBlocks: BlockType[] = [];
    let minX = 0;
    let maxX = 22;
    let minY = 0;
    let maxY = 22;
    // 分为 gameConfig.levelNum 批，依次生成，每批的边界不同
    for (let i = 0; i < gameConfig.levelNum; i++) {
      let nextBlockNum = Math.min(gameConfig.levelBlockNum, leftBlockNum);
      // 最后一批，分配所有 leftBlockNum
      if (i == gameConfig.levelNum - 1) {
        nextBlockNum = leftBlockNum;
      }
      // 边界收缩
      if (gameConfig.borderStep > 0) {
        const dir = i % 4;
        if (i > 0) {
          if (dir === 0) {
            minX += gameConfig.borderStep;
          } else if (dir === 1) {
            maxY -= gameConfig.borderStep;
          } else if (dir === 2) {
            minY += gameConfig.borderStep;
          } else {
            maxX -= gameConfig.borderStep;
          }
        }
      }
      const nextGenBlocks = allBlocks.slice(pos, pos + nextBlockNum);
      levelBlocks.push(...nextGenBlocks);
      pos = pos + nextBlockNum;
      // 生成块的坐标
      genLevelBlockPos(nextGenBlocks, minX, minY, maxX, maxY);
      leftBlockNum -= nextBlockNum;
      if (leftBlockNum <= 0) {
        break;
      }
    }
    console.log("leftBlockNum", leftBlockNum);

    // 4. 初始化空插槽
    const slotArea: BlockType[] = new Array(gameConfig.slotNum).fill(null);
    console.log("randomBlocks", randomBlocks);

    return {
      levelBlocks,
      randomBlocks,
      slotArea,
    };
  };

  const genLevelBlockPos = (
    blocks: BlockType[],
    minX: number,
    minY: number,
    maxX: number,
    maxY: number
  ) => {
    // 记录这批块的坐标，用于保证同批次元素不能完全重叠
    const currentPosSet = new Set<string>();
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      // 随机生成坐标
      let newPosX;
      let newPosY;
      let key;
      while (true) {
        newPosX = Math.floor(Math.random() * maxX + minX);
        newPosY = Math.floor(Math.random() * maxY + minY);
        key = newPosX + "," + newPosY;
        // 同批次元素不能完全重叠
        if (!currentPosSet.has(key)) {
          break;
        }
      }
      chessBoard[newPosX][newPosY].blocks.push(block);
      currentPosSet.add(key);
      block.x = newPosX;
      block.y = newPosY;
      // 填充层级关系
      genLevelRelation(block);
    }
  };

  /**
   * 给块绑定层级关系（用于确认哪些元素是当前可点击的）
   * 核心逻辑：每个块压住和其坐标有交集棋盘格内所有 level 大于它的点，双向建立联系
   * @param block
   */
  const genLevelRelation = (block: BlockType) => {
    // 确定该块附近的格子坐标范围
    const minX = Math.max(block.x - 2, 0);
    const minY = Math.max(block.y - 2, 0);
    const maxX = Math.min(block.x + 3, boxWidthNum - 2);
    const maxY = Math.min(block.y + 3, boxWidthNum - 2);
    // 遍历该块附近的格子
    let maxLevel = 0;
    for (let i = minX; i < maxX; i++) {
      for (let j = minY; j < maxY; j++) {
        const relationBlocks = chessBoard[i][j].blocks;
        if (relationBlocks.length > 0) {
          // 取当前位置最高层的块
          const maxLevelRelationBlock =
            relationBlocks[relationBlocks.length - 1];
          // 排除自己
          if (maxLevelRelationBlock.id === block.id) {
            continue;
          }
          maxLevel = Math.max(maxLevel, maxLevelRelationBlock.level);
          block.higherThanBlocks.push(maxLevelRelationBlock);
          maxLevelRelationBlock.lowerThanBlocks.push(block);
        }
      }
    }
    // 比最高层的块再高一层（初始为 1）
    block.level = maxLevel + 1;
  };

  const doClickBlock = (block: BlockType, randomIdx = -1, force = false) => {
    // 已经输了 / 已经被点击 / 有上层块（且非强制和圣光），不能再点击
    if (
      currSlotNum.current >= gameConfig.slotNum ||
      block.status !== 0 ||
      (block.lowerThanBlocks.length > 0 && !force && !isHolyLight.current)
    ) {
      return;
    }
    isHolyLight.current = false;
    // 修改元素状态为已点击
    block.status = 1;
    // 移除当前元素
    if (randomIdx >= 0) {
      // 移除所点击的随机区域的第一个元素
      randomBlocksVal.current[randomIdx] = randomBlocksVal.current[
        randomIdx
      ].slice(1, randomBlocksVal.current[randomIdx].length);
    } else {
      // 非随机区才可撤回
      opHistory.push(block);
      // 移除覆盖关系
      block.higherThanBlocks.forEach((higherThanBlock) => {
        _.remove(higherThanBlock.lowerThanBlocks, (lowerThanBlock) => {
          return lowerThanBlock.id === block.id;
        });
      });
    }
    // 新元素加入插槽
    let tempSlotNum = currSlotNum.current;
    slotAreaVal.current[tempSlotNum] = block;
    // 检查是否有可消除的
    // block => 出现次数
    const map: Record<string, number> = {};
    // 去除空槽
    const tempSlotAreaVal = slotAreaVal.current.filter(
      (slotBlock: any) => !!slotBlock
    );
    tempSlotAreaVal.forEach((slotBlock: any) => {
      const type = slotBlock.type;
      if (!map[type]) {
        map[type] = 1;
      } else {
        map[type]++;
      }
    });
    console.log("tempSlotAreaVal", tempSlotAreaVal);
    console.log("map", map);
    // 得到新数组
    const newSlotAreaVal = new Array(gameConfig.slotNum).fill(null);
    tempSlotNum = 0;
    tempSlotAreaVal.forEach((slotBlock: any) => {
      // 成功消除（不添加到新数组中）
      if (map[slotBlock.type] >= gameConfig.composeNum) {
        // 块状态改为已消除
        slotBlock.status = 2;
        // 已消除块数 +1
        clearBlockNum.current++;
        // 清除操作记录，防止撤回
        opHistory = [];
        return;
      }
      newSlotAreaVal[tempSlotNum++] = slotBlock;
    });
    slotAreaVal.current = newSlotAreaVal;
    currSlotNum.current = tempSlotNum;
    // 游戏结束
    if (tempSlotNum >= gameConfig.slotNum) {
      gameStatus.current = 2;
      setTimeout(() => {
        alert("你输了");
      }, 2000);
    }
    if (clearBlockNum.current >= totalBlockNum.current) {
      gameStatus.current = 3;
    }
  };

  const doStart = () => {
    gameStatus.current = 0;
    const { levelBlocks, randomBlocks, slotArea } = initGame();
    console.log(levelBlocks, randomBlocks, slotArea);
    levelBlocksVal.current = levelBlocks;
    randomBlocksVal.current = randomBlocks;
    slotAreaVal.current = slotArea;
    gameStatus.current = 1;
  };

  // ... (rest of the code)

  const doShuffle = () => {
    // ... (rest of the code)
  };

  const doBroke = () => {
    // ... (rest of the code)
  };

  const doRevert = () => {
    // ... (rest of the code)
  };

  const doRemove = () => {
    // ... (rest of the code)
  };

  const doHolyLight = () => {
    isHolyLight.current = true;
  };

  const doSeeRandom = () => {
    canSeeRandom.current = !canSeeRandom.current;
  };

  // ... (rest of the code)

  return {
    gameStatus: gameStatus.current,
    levelBlocksVal:levelBlocksVal.current,
    randomBlocksVal:randomBlocksVal.current,
    slotAreaVal:slotAreaVal.current,
    widthUnit:widthUnit,
    heightUnit:heightUnit,
    currSlotNum:currSlotNum.current,
    opHistory:opHistory,
    totalBlockNum:totalBlockNum.current,
    clearBlockNum:clearBlockNum.current,
    isHolyLight:isHolyLight.current,
    canSeeRandom:canSeeRandom.current,
    doClickBlock,
    doStart,
    doShuffle,
    doBroke,
    doRemove,
    doRevert,
    doHolyLight,
    doSeeRandom,
  };
};

export default useGame;
