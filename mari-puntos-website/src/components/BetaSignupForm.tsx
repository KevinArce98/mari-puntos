import { useActionState } from 'react';

type State = {
  success: boolean;
  message?: string;
  error?: string;
};

const initialState: State = {
  success: false,
  message: '',
  error: '',
};

async function submitBetaSignup(_prevState: State, formData: FormData): Promise<State> {
  const response = await fetch('/api/beta-signup', {
    method: 'POST',
    body: formData,
  });
  return response.json();
}

export function BetaSignupForm() {
  const [state, formAction, isPending] = useActionState(submitBetaSignup, initialState);

  return (
    <form action={formAction} className="max-w-md mx-auto mb-8">
      <div
        className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
        aria-hidden="true"
      >
        <label htmlFor="company">No completar este campo</label>
        <input type="text" id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          name="email"
          placeholder="tu@email.com"
          required
          disabled={isPending}
          className="flex-1 px-6 py-4 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all disabled:opacity-50 bg-white shadow-lg"
        />
        <button
          type="submit"
          disabled={isPending}
          className="px-10 py-4 bg-white text-[#0F766E] rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isPending ? 'Enviando...' : 'Acceder'}
        </button>
      </div>

      {state.success && state.message && (
        <div className="mt-4 p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
          <p className="text-white font-semibold">{state.message}</p>
        </div>
      )}

      {!state.success && state.error && (
        <div className="mt-4 p-4 bg-red-500/20 backdrop-blur-sm rounded-2xl border border-red-300/30">
          <p className="text-white font-semibold">{state.error}</p>
        </div>
      )}
    </form>
  );
}
