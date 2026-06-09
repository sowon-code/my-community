import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase, toEmail } from '../lib/supabase'
import styles from './Login.module.css'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!username || !password) {
      setError('아이디와 비밀번호를 입력해주세요.')
      return
    }
    setLoading(true)
    setError('')
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: toEmail(username),
      password,
    })
    setLoading(false)
    if (authError) {
      setError('아이디 또는 비밀번호가 올바르지 않아요 🐾')
    } else {
      navigate('/posts')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* 로고 */}
        <div className={styles.logo}>
          <div className={styles.dogIcon}>🐶</div>
          <h1 className={styles.siteName}>Love Dog Community</h1>
          <p className={styles.siteDesc}>유기견 입양 정보 공유 커뮤니티</p>
        </div>

        <h2 className={styles.title}>로그인</h2>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>아이디</label>
            <input
              type="text"
              className="input-field"
              placeholder="아이디를 입력해주세요"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>비밀번호</label>
            <input
              type="password"
              className="input-field"
              placeholder="비밀번호를 입력해주세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? '로그인 중...' : '로그인 🐾'}
          </button>
        </form>

        <div className={styles.footer}>
          <span>아직 회원이 아니신가요?</span>
          <Link to="/register" className={styles.link}>회원가입하러 가기 →</Link>
        </div>
      </div>
    </div>
  )
}
