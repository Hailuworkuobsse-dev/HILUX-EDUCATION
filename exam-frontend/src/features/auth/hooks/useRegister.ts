import { useMutation } from '@/hooks/useMutation';
import { authApi, type RegisterResponse } from '../api';
import type { RegisterInput } from '../schemas';

export function useRegister() {
  return useMutation<RegisterResponse, RegisterInput>(async (input) => {
    return authApi.register({
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      password: input.password,
      role: input.role
    });
  });
}
