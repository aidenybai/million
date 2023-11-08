import { useState, useEffect, useRef } from 'react';
import { block } from 'million/react';
import { BsClipboardCheck } from 'react-icons/bs';
import { FiRefreshCcw } from 'react-icons/fi';

const PasswordGenerator = block(() => {
  const {
    copyPasswordToClipboard,
    password,
    passwordInputRef,
    setPassword,
    generatePassword,
  } = useGeneratePassword();
  return (
    <div className="password_generator">
      <h1>Password Generator</h1>

      <p>
        Create strong and secure passwords to keep your account safe online.
      </p>

      <div className="password_generator_top_section">
        {/* Password Generator Output */}
        <div className="password_generator_output_container">
          <input
            ref={passwordInputRef}
            type="text"
            readOnly
            value={password.value}
          />

          <Tooltip text="Copy to Clipboard" show={password.isCopied}>
            <button
              type="button"
              className="right-icon"
              onClick={copyPasswordToClipboard}
            >
              <BsClipboardCheck />
            </button>
          </Tooltip>
        </div>

        <button
          type="button"
          className="password_generator_refresh_password"
          onClick={generatePassword}
        >
          <FiRefreshCcw />
        </button>
      </div>

      {/* Options */}

      <div className="password_generator_customizable_options">
        <div className="password_generator_customizable_options__length">
          <label>Length: {password.length}</label>
          <input
            type="range"
            min="3"
            max="100"
            value={password.length}
            className="timeline"
            onChange={(e) => {
              setPassword({
                ...password,
                length: parseInt(e.target.value),
              });
            }}
          />
        </div>

        <div className="password_generator_customizable_options__others">
          <div className="password_generator_customizable_options__password_type">
            <label>Password Type: </label>
            <select
              value={password.password_type}
              onChange={(e) =>
                setPassword({
                  ...password,
                  password_type: e.target.value as IPasswordType,
                })
              }
            >
              <option value={'password'}>Password</option>
              <option value={'pin'}>PIN</option>
            </select>
          </div>

          <div className="password_generator_customizable_options__password_type">
            <input
              id="number_checkbox"
              name="number_checkbox"
              disabled={password.password_type === 'pin'}
              type="checkbox"
              checked={password.numbers!}
              onChange={() =>
                setPassword({ ...password, numbers: !password.numbers })
              }
              className="password_generator_customizable_options__checkbox"
            />
            <label htmlFor="number_checkbox">Number</label>
          </div>

          <div className="password_generator_customizable_options__password_type">
            <input
              id="symbol_checkbox"
              name="symbol_checkbox"
              type="checkbox"
              disabled={password.password_type === 'pin'}
              onChange={() =>
                setPassword({ ...password, symbols: !password.symbols })
              }
              className="password_generator_customizable_options__checkbox"
            />
            <label htmlFor="symbol_checkbox">Symbols</label>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PasswordGenerator;

const Tooltip = ({ text, children, show }: IToolTipProps) => {
  return (
    <div className="password_generator_tooltip-container">
      <div>{children}</div>
      <p className={`password_generator_tooltip-text ${show ? 'visible' : ''}`}>
        {text}
      </p>
    </div>
  );
};

type IPasswordType = 'password' | 'pin';

interface IPasswordState {
  value: string;
  password_type: IPasswordType;
  length: number;
  isCopied: boolean;
  numbers?: boolean;
  symbols?: boolean;
}

interface IToolTipProps {
  children: JSX.Element;
  text: string;
  show: boolean;
}

const useGeneratePassword = () => {
  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  const [password, setPassword] = useState<IPasswordState>({
    value: '',
    password_type: 'password',
    length: 3,
    isCopied: false,
    numbers: false,
    symbols: false,
  });

  const copyPasswordToClipboard = () => {
    if (passwordInputRef.current) {
      passwordInputRef.current.select();
      document.execCommand('copy');

      // Deselect the text
      window.getSelection()?.removeAllRanges();

      setPassword({ ...password, isCopied: true });

      setTimeout(() => {
        setPassword({ ...password, isCopied: false });
      }, 3000);
    }
  };

  const generatePassword = () => {
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+{}[]|:;"<>,.?/~';

    let charset = '';

    if (password.password_type === 'password') {
      charset += lowercaseChars + uppercaseChars;

      if (password.numbers) {
        charset += numberChars;
      }

      if (password.symbols) {
        charset += symbolChars;
      }
    }

    if (password.password_type === 'pin') {
      charset += numberChars;
    }

    let generatedValue = '';

    for (let i = 0; i < password.length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      generatedValue += charset[randomIndex];
    }

    setPassword({ ...password, value: generatedValue });
  };

  useEffect(() => {
    generatePassword();
  }, [
    password.length,
    password.numbers,
    password.password_type,
    password.symbols,
  ]);

  return {
    passwordInputRef,
    password,
    setPassword,
    copyPasswordToClipboard,
    generatePassword,
  };
};
