"use strict";

class Calculator {
  constructor(options) {
    this._el = options.el;
    this._allKeys = this._el.querySelectorAll('.calculator__key');
    this._display = this._el.querySelector('.calculator__display');

    this._clear();
    this._print();

    this._el.addEventListener('click', this._onKeyClick.bind(this));
    this._el.addEventListener('mousedown', this._addKeyPress.bind(this));
    this._el.addEventListener('mouseup', this._removeKeyPress.bind(this));
    this._el.addEventListener('mouseout', this._removeKeyPress.bind(this));
    window.addEventListener('keydown', this._hardwareKeyboardHandler.bind(this));
    window.addEventListener('keyup', this._removeKeyPress.bind(this));
  }

  _clear() {
    this._input = '';
    this._a = 0;
    this._b = 0;
    this._operator = null;
    this._allKeys.forEach(key => key.classList.remove('calculator__key_selected'));

    // Переменные необходимые для сценария, когда нажимают многократно =, без ввода новых параметров
    this._singleEqual = false;
    this._dobleEqual = false;
    this._stickyB = null;
  }

  _print() {
    // Удобней работать с '.' как десятичным разделителем для
    // внутреннего представления, заменяя при выводе на ','
    this._display.innerHTML = this._input.replace('.', ',') || '0';

    // Корректируем размер шрифта чтобы строка всегда вмещалась в экран
    let fontSize = 46;
    const screenWidth = 208;
    this._display.style.fontSize = '';
    while(this._display.offsetWidth > screenWidth) {
      fontSize--;
      this._display.style.fontSize = `${fontSize}px`;
    }
  }

  _onKeyClick(event) {
    if (!event.target.classList.contains('calculator__key')) {
      return;
    }
    if (event.target.hasAttribute('data-command')) {
      this._processCommandKey(event.target);
    } else if (event.target.hasAttribute('data-digit')) {
      this._processDigitKey(event.target);
    } else if (event.target.hasAttribute('data-operator')) {
      this._processOperatorKey(event.target);
    }
  }

  _addKeyPress(event) {
    if (!event.target.classList.contains('calculator__key')) {
      return;
    }
    event.target.classList.add('calculator__key_pressed');
  }

  _removeKeyPress() {
    // Пользователь может нажать кнопку мыши над одной кнопкой калькулятора, 
    // а поднять над другой, поэтому снимаем выделение у всех кнопок
    this._allKeys.forEach(key => key.classList.remove('calculator__key_pressed'));
  }

  _processCommandKey(key) {
    const command = key.dataset.command;
    switch (command) {
      case 'clear':
        this._clear();
        break;
      case 'plus-minus':
        if (this._input === '') {
          return;
        }
        this._input = String(parseFloat(this._input) * -1);
        break;
      case 'percent':
        if (this._input === '') {
          return;
        }
        this._input = String(parseFloat(this._input) / 100);
        break;
    }
    this._print();
  }

  _processDigitKey(key) {
    const digit = key.dataset.digit;
    // Чтобы не получалось 00000
    if (digit === '0' && this._input === '') {
      return;
    }
    // Чтобы нельзя было ввести больше одной точки
    if (digit === '.' && this._input.includes('.')) {
      return;
    }
    // Если точка первая в вводе, добавляем перед ней 0
    if (digit === '.' && this._input === '') {
      this._input = '0';
    }
    this._input += digit;
    this._print();
  }

  _processOperatorKey(key) {
    const operators = {
      'plus':     (a, b) => a + b,
      'minus':    (a, b) => a - b,
      'multiply': (a, b) => a * b,
      'divide':   (a, b) => a / b
    };
    const operator = key.dataset.operator;
    this._allKeys.forEach(key => key.classList.remove('calculator__key_selected'));
    if (operator !== 'equal') {
      key.classList.add('calculator__key_selected');
    }

    if (operator === 'equal') {
      if (!this._operator) {
        return;
      }
      this._dobleEqual = this._singleEqual ? true : false;

      // Логика необходимая для работы многократного нажатия =, без ввода новых аргументов
      if (this._dobleEqual) {
        this._a = parseFloat(this._input || 0);
        this._b = this._stickyB;
      } else {
        this._b = parseFloat(this._input || 0);
        this._stickyB = this._b;
      }

      this._input = String(operators[this._operator](this._a, this._b));

      this._singleEqual = true;
      this._print();
    } else {
      this._a = parseFloat(this._input || 0);
      this._operator = operator;
      this._input = '';
      this._singleEqual = false;
    }
  }

  _backspace() {
    this._input = this._input.slice(0, -1);
    this._print();
  }

  _hardwareKeyboardHandler(event) {
    // Некоторые кнопки имеют два разных кода, для основной 
    // и боковой цифровой клавиатуры
    const keyCodesMap = {
      '13':       'data-operator="equal"',
      '27':       'data-command="clear"',
      '48':       'data-digit="0"',
      '49':       'data-digit="1"',
      '50':       'data-digit="2"',
      '51':       'data-digit="3"',
      '52':       'data-digit="4"',
      '53':       'data-digit="5"',
      '53shift':  'data-command="percent"',
      '54':       'data-digit="6"',
      '55':       'data-digit="7"',
      '56':       'data-digit="8"',
      '56shift':  'data-operator="multiply"',
      '57':       'data-digit="9"',
      '96':       'data-digit="0"',
      '97':       'data-digit="1"',
      '98':       'data-digit="2"',
      '99':       'data-digit="3"',
      '100':      'data-digit="4"',
      '101':      'data-digit="5"',
      '102':      'data-digit="6"',
      '103':      'data-digit="7"',
      '104':      'data-digit="8"',
      '105':      'data-digit="9"',
      '106':      'data-operator="multiply"',
      '107':      'data-operator="plus"',
      '109':      'data-operator="minus"',
      '110':      'data-digit="."',
      '111':      'data-operator="divide"',
      '186shift': 'data-operator="multiply"',
      '187':      'data-operator="equal"',
      '187shift': 'data-operator="plus"',
      '188':      'data-digit="."',
      '189':      'data-operator="minus"',
      '189alt':   'data-command="plus-minus"',
      '190':      'data-digit="."',
      '191':      'data-operator="divide"'
    }

    let code = event.keyCode;
    code = event.shiftKey ? code + 'shift' : code;
    code = event.altKey ? code + 'alt' : code;

    // Backspace - единственный случай, когда у кнопки на настоящей клавиатуре
    // нет соответствующей кнопки на клавиатуре калькулятора
    if (code === 8) {
      this._backspace();
    }

    if (!(code in keyCodesMap)) {
      return;
    }

    const key = this._el.querySelector(`[${keyCodesMap[code]}]`);
    key.dispatchEvent(new Event('click', {bubbles: true}));
    key.dispatchEvent(new Event('mousedown', {bubbles: true}));
  }
}

new Calculator({
  el: document.querySelector('.calculator')
});
