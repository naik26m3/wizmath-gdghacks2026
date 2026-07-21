import { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Modal, { ModalError } from '@/components/wizmath/hextech/Modal';
import GoogleIcon from './GoogleIcon';

export default function SignInModal() {
  const { user, isSignInModalOpen, closeSignInModal, signIn, isLoadingAuth, authError } = useAuth();

  useEffect(() => {
    if (user && isSignInModalOpen) closeSignInModal();
  }, [user, isSignInModalOpen, closeSignInModal]);

  return (
    <Modal
      open={isSignInModalOpen}
      onClose={closeSignInModal}
      label="Sign in to ArcaneMath"
      glyph="gem"
      title="WELCOME TO"
      titleAccent="ARCANEMATH"
      subtitle="Sign in to publish your own activities and explore creations from the community."
      footnote="By continuing, you agree to use ArcaneMath for educational purposes."
    >
      <button
        onClick={signIn}
        disabled={isLoadingAuth}
        className="hx-google-btn"
        style={{ opacity: isLoadingAuth ? 0.6 : 1, cursor: isLoadingAuth ? 'not-allowed' : 'pointer' }}
      >
        <GoogleIcon size={22} />
        Sign in with Google
      </button>

      <ModalError>
        {typeof authError === 'string' ? authError : authError?.message}
      </ModalError>
    </Modal>
  );
}
