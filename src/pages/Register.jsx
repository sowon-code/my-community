import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase, toEmail } from '../lib/supabase'
import styles from './Register.module.css'

const PASSWORD_RULES = [
  { label: '8자 이상', test: (v) => v.length >= 8 },
  { label: '영문 포함', test: (v) => /[a-zA-Z]/.test(v) },
  { label: '숫자 포함', test: (v) => /[0-9]/.test(v) },
]

export default function Register() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [usernameCheck, setUsernameCheck] = useState(null) // null | true | false
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingUsername, setCheckingUsername] = useState(false)

  const passwordValid = PASSWORD_RULES.every((r) => r.test(password))

  const handleCheckUsername = async () => {
    if (!username) return
    setCheckingUsername(true)
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle()
    setCheckingUsername(false)
    setUsernameCheck(data === null) // null이면 사용 가능
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!username || !password || !nickname) {
      setError('모든 항목을 입력해주세요.')
      return
    }
    if (usernameCheck === false) {
      setError('이미 사용 중인 아이디예요.')
      return
    }
    if (!passwordValid) {
      setError('비밀번호 규칙을 확인해주세요.')
      return
    }
    setLoading(true)
    setError('')
    const { error: authError } = await supabase.auth.signUp({
      email: toEmail(username),
      password,
      options: {
        data: { username, nickname },
        emailRedirectTo: null,
      },
    })
    setLoading(false)
    if (authError) {
      setError(authError.message)
    } else {
      navigate('/posts')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.emoji}>🐾</span>
          <h2 className={styles.title}>회원가입</h2>
          <p className={styles.sub}>Love Dog Community에 오신 걸 환영해요!</p>
        </div>

        <form onSubmit={handleRegister} className={styles.form}>
          {/* 아이디 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>아이디</label>
            <div className={styles.row}>
              <input
                type="text"
                className="input-field"
                placeholder="아이디 입력"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setUsernameCheck(null) }}
              />
              <button
                type="button"
                className={styles.checkBtn}
                onClick={handleCheckUsername}
                disabled={!username || checkingUsername}
              >
                {checkingUsername ? '확인중' : '중복확인'}
              </button>
            </div>
            {usernameCheck === true && <p className={styles.okMsg}>✅ 사용 가능한 아이디예요!</p>}
            {usernameCheck === false && <p className="error-msg">❌ 이미 사용 중인 아이디예요.</p>}
          </div>

          {/* 닉네임 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>닉네임</label>
            <input
              type="text"
              className="input-field"
              placeholder="사용할 닉네임을 입력해주세요"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>

          {/* 비밀번호 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>비밀번호</label>
            <input
              type="password"
              className="input-field"
              placeholder={!username ? '아이디를 먼저 입력해주세요' : '비밀번호 입력'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!username}
            />
            {password && (
              <div className={styles.rules}>
                {PASSWORD_RULES.map((r) => (
                  <span key={r.label} className={r.test(password) ? styles.ruleOk : styles.ruleFail}>
                    {r.test(password) ? '✓' : '✗'} {r.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%' }}
            disabled={loading || !passwordValid || usernameCheck !== true}
          >
            {loading ? '가입 중...' : '가입하기 🐶'}
          </button>
        </form>

        <div className={styles.footer}>
          <span>이미 계정이 있으신가요?</span>
          <Link to="/" className={styles.link}>로그인하러 가기 →</Link>
        </div>
      </div>
    </div>
  )
}
