import type { ValidationErrors } from "../../lib/validation";

export function FormErrorList({ errors }: { errors: ValidationErrors }) {
  const messages = Object.values(errors);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="form-error" role="alert">
      <p>入力内容を確認してください。</p>
      <ul>
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
