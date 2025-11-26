import React, { useState, useEffect } from "react";

export default function Clicker() {
  const [score, setScore] = useState(() => {
    return Number(localStorage.getItem("score")) || 0;
  });
  const [level, setLevel] = useState(() => {
    return Number(localStorage.getItem("level")) || 1;
  });
  const [clickPower, setClickPower] = useState(() => {
    return Number(localStorage.getItem("clickPower")) || 1;
  });
  
  const [bonusActive, setBonusActive] = useState(false);
  const [bonusTime, setBonusTime] = useState(0);
  const [autoClicker, setAutoClicker] = useState(() => {
    return Number(localStorage.getItem("autoClicker")) || 0;
  });
  
  const [upgrades, setUpgrades] = useState(() => {
    const saved = localStorage.getItem("upgrades");
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      doubleClick: { level: 0, cost: 50, multiplier: 2 },
      autoClicker: { level: 0, cost: 100, rate: 1 },
      megaClick: { level: 0, cost: 200, power: 5 }
    };
  });

  const [difficulty, setDifficulty] = useState(() => {
    return Number(localStorage.getItem("difficulty")) || 1;
  });

  // се
  useEffect(() => {
    localStorage.setItem("score", score.toString());
    localStorage.setItem("level", level.toString());
    localStorage.setItem("clickPower", clickPower.toString());
    localStorage.setItem("autoClicker", autoClicker.toString());
    localStorage.setItem("upgrades", JSON.stringify(upgrades));
    localStorage.setItem("difficulty", difficulty.toString());
  }, [score, level, clickPower, autoClicker, upgrades, difficulty]);

  // таймер бонускиииии из свит бананзы
  useEffect(() => {
    if (!bonusActive) return;

    const interval = setInterval(() => {
      setBonusTime(function(t) {
        if (t <= 1) {
          setBonusActive(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return function() {
      clearInterval(interval);
    };
  }, [bonusActive]);

  // автокликер
  useEffect(() => {
    if (autoClicker <= 0) return;

    const interval = setInterval(() => {
      setScore(function(prevScore) {
        return prevScore + autoClicker;
      });
    }, 1000);

    return function() {
      clearInterval(interval);
    };
  }, [autoClicker]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDifficulty(function(prev) {
        return Math.min(prev + 0.1, 3);
      });
    }, 30000);

    return function() {
      clearInterval(interval);
    };
  }, []);

  function handleClick() {
    // базовая сила клика
    let basePoints = Math.floor(clickPower * (1 + level * 0.3));
    if (basePoints < 1) basePoints = 1;
    
    let points = basePoints;
    
    // Крит
    const criticalChance = Math.random();
    if (criticalChance < 0.05) {
      points = points * 3;
    }
    
    // БОНУСКААААА
    if (bonusActive) {
      points = points * 2;
    }
    
    const finalPoints = Math.max(1, Math.floor(points / difficulty));
    
    const newScore = score + finalPoints;
    setScore(newScore);

    // ап
    if (newScore >= level * 50) {
      setLevel(level + 1);
    }

    // бонуска за 100
    if (newScore > 0 && newScore % 100 === 0) {
      activateBonus();
    }
  }

  function activateBonus() {
    setBonusActive(true);
    setBonusTime(15);
  }

  function buyUpgrade(upgradeType) {
    const upgrade = upgrades[upgradeType];
    
    if (score >= upgrade.cost) {
      setScore(function(prev) {
        return prev - upgrade.cost;
      });
      
      const newUpgrades = Object.assign({}, upgrades);
      newUpgrades[upgradeType] = {
        ...upgrade,
        level: upgrade.level + 1,
        cost: Math.floor(upgrade.cost * 1.8 * difficulty)
      };
      
      setUpgrades(newUpgrades);

      // бафы
      switch (upgradeType) {
        case 'doubleClick':
          setClickPower(function(prev) {
            return prev * upgrade.multiplier;
          });
          break;
        case 'autoClicker':
          setAutoClicker(function(prev) {
            return prev + upgrade.rate;
          });
          break;
        case 'megaClick':
          setClickPower(function(prev) {
            return prev + upgrade.power;
          });
          break;
        default:
          break;
      }
    }
  }

  function resetGame() {
    setScore(0);
    setLevel(1);
    setClickPower(1);
    setAutoClicker(0);
    setBonusActive(false);
    setBonusTime(0);
    setDifficulty(1);
    setUpgrades({
      doubleClick: { level: 0, cost: 50, multiplier: 2 },
      autoClicker: { level: 0, cost: 100, rate: 1 },
      megaClick: { level: 0, cost: 200, power: 5 }
    });
    localStorage.clear();
  }

  function formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num;
  }

  // значения на кнопке
  function getDisplayClickValue() {
    const baseValue = Math.floor(clickPower * (1 + level * 0.3));
    const withDifficulty = Math.max(1, Math.floor(baseValue / difficulty));
    return withDifficulty;
  }

  return React.createElement(
    "div",
    { className: "game-card" },

    React.createElement("h2", null, "⚡ Улучшенный Кликер"),
    
    // стата
    React.createElement("div", { className: "stats-grid" },
      React.createElement("p", { className: "info" }, `Очки: ${formatNumber(score)}`),
      React.createElement("p", { className: "info" }, `Уровень: ${level}`),
      React.createElement("p", { className: "info" }, `Сила: ${formatNumber(clickPower)}`),
      React.createElement("p", { className: "info" }, `Сложность: x${difficulty.toFixed(1)}`)
    ),

    // бонуска
    bonusActive ?
      React.createElement("p", { className: "bonus" }, `Бонус ×2! Осталось: ${bonusTime} сек`) :
      null,

    // автокликер
    autoClicker > 0 ?
      React.createElement("p", { className: "auto-info" }, `Автокликер: +${autoClicker}/сек`) :
      null,

    React.createElement(
      "button",
      {
        className: "main-btn",
        onClick: handleClick
      },
      `Клик! (+${formatNumber(getDisplayClickValue())})`
    ),

    //улучшения
    React.createElement("h3", null, "Улучшения"),
    
    // дабл клик
    React.createElement(
      "div",
      { className: "upgrade" },
      React.createElement(
        "div",
        { className: "upgrade-info" },
        React.createElement("h4", null, "Двойной клик"),
        React.createElement("p", null, "Удваивает силу клика"),
        React.createElement("span", null, `Уровень: ${upgrades.doubleClick.level}`)
      ),
      React.createElement(
        "button",
        {
          className: score >= upgrades.doubleClick.cost ? "buy-btn" : "buy-btn disabled",
          onClick: function() { buyUpgrade('doubleClick'); }
        },
        `Купить за ${formatNumber(upgrades.doubleClick.cost)}`
      )
    ),

    // автоклик
    React.createElement(
      "div",
      { className: "upgrade" },
      React.createElement(
        "div",
        { className: "upgrade-info" },
        React.createElement("h4", null, "Автокликер"),
        React.createElement("p", null, "+1 очко в секунду"),
        React.createElement("span", null, `Уровень: ${upgrades.autoClicker.level}`)
      ),
      React.createElement(
        "button",
        {
          className: score >= upgrades.autoClicker.cost ? "buy-btn" : "buy-btn disabled",
          onClick: function() { buyUpgrade('autoClicker'); }
        },
        `Купить за ${formatNumber(upgrades.autoClicker.cost)}`
      )
    ),

    // мега клик
    React.createElement(
      "div",
      { className: "upgrade" },
      React.createElement(
        "div",
        { className: "upgrade-info" },
        React.createElement("h4", null, "Мега клик"),
        React.createElement("p", null, "+5 к силе клика"),
        React.createElement("span", null, `Уровень: ${upgrades.megaClick.level}`)
      ),
      React.createElement(
        "button",
        {
          className: score >= upgrades.megaClick.cost ? "buy-btn" : "buy-btn disabled",
          onClick: function() { buyUpgrade('megaClick'); }
        },
        `Купить за ${formatNumber(upgrades.megaClick.cost)}`
      )
    ),

    // сброс
    React.createElement(
      "button",
      {
        className: "reset-btn",
        onClick: resetGame
      },
      "Сбросить прогресс"
    )
  );
}