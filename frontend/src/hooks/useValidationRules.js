export const useValidationRules = () => ({
    nome: { required: 'Nome é obrigatório' },
    cpf: { required: 'CPF é obrigatório' },
    telefone: {},
    matricula: { required: 'Matrícula é obrigatória' },
    senha: {
        required: 'Senha é obrigatória',
        minLength: { value: 6, message: 'A senha deve conter no mínimo 6 caracteres' },
    },
    grupo: { required: 'Grupo é obrigatório' },
    descricao: { required: 'Descrição é obrigatória' },
    valor_unitario: {
        required: 'Valor unitário é obrigatório',
        min: {
            value: 0, message: 'Valor unitário deve ser maior ou igual a 0'
        }
    },
});

export default useValidationRules;