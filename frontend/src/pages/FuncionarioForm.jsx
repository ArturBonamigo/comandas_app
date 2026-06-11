import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PageLayout from "../components/common/PageLayout";
import { useValidationRules } from '../hooks/useValidationRules';
import UniqueValidator, { useFieldValidation } from '../components/common/UniqueValidator';

const FuncionarioForm = () => {
    const { control, handleSubmit, formState: { errors } } = useForm();

    const validationRules = useValidationRules();
    const navigate = useNavigate();

    const onSubmit = (data) => {
        console.log("Dados do funcionário:", data);
    };

    const handleCancel = () => {
        navigate('/funcionarios');
    };

    // Hook de validação de CPF reutilizável
    const { dialog: cpfDialog, validateField: validateCpf, closeDialog, clearField } = useFieldValidation(funcionarioService, id, 'checkCpfExists');

    // Funções do diálogo de CPF existente
    const handleDialogCancel = () => {
        closeDialog();
        clearField();
        // Limpa o campo CPF
        reset(prev => ({ ...prev, cpf: '' }));
    };

    const handleDialogView = (funcionario) => {
        closeDialog();
        navigate("/funcionario/view/${funcionario.id}");
    }

    const handleDialogEdit = (funcionario) => {
        closeDialog();
        navigate("/funcionario/edit/${funcionario.id}");
    }

    return (
        <PageLayout title="Dados Funcionário">
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>

                <Controller
                    name="nome"
                    control={control}
                    defaultValue=""
                    rules={validationRules.nome}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Nome"
                            fullWidth
                            margin="normal"
                            error={!!errors.nome}
                            helperText={errors.nome?.message}
                        />
                    )}
                />

                <Controller
                    name="matricula"
                    control={control}
                    defaultValue=""
                    rules={validationRules.matricula}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Matrícula"
                            fullWidth
                            margin="normal"
                            error={!!errors.matricula}
                            helperText={errors.matricula?.message}
                        />
                    )}
                />

                <Controller
                    name="cpf"
                    control={control}
                    defaultValue=""
                    rules={validationRules.cpf}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            disabled={isReadOnly}
                            label="CPF"
                            fullWidth
                            margin="normal"
                            error={!!errors.cpf}
                            helperText={errors.cpf?.message}
                            onChange={(e) => {
                                const value = cleanCpf(e.target.value);
                                field.onChange(value);
                            }}
                            onBlur={() => {
                                if (!isReadOnly) {
                                    validateCpf(field.value);
                                }
                            }}
                            value={field.value ? applyCpfMask(field.value) : ""}
                        />
                    )}
                />
                <Controller
                    name="telefone"
                    control={control}
                    defaultValue=""
                    rules={validationRules.telefone}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Telefone"
                            fullWidth
                            margin="normal"
                            error={!!errors.telefone}
                            helperText={errors.telefone?.message}
                        />
                    )}
                />

                <Controller
                    name="grupo"
                    control={control}
                    defaultValue=""
                    rules={validationRules.grupo}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Grupo"
                            fullWidth
                            margin="normal"
                            type="number"
                            error={!!errors.grupo}
                            helperText={errors.grupo?.message}
                        />
                    )}
                />

                <Controller
                    name="senha"
                    control={control}
                    defaultValue=""
                    rules={validationRules.senha}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Senha"
                            fullWidth
                            margin="normal"
                            type="password"
                            error={!!errors.senha}
                            helperText={errors.senha?.message}
                        />
                    )}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button sx={{ mr: 1 }} onClick={handleCancel}>
                        Cancelar
                    </Button>

                    <Button type="submit" variant="contained">
                        Cadastrar
                    </Button>
                </Box>

            </Box>

            {/* Diálogo de CPF existente - Componente Reutilizável */}
            <UniqueValidator
                open={cpfDialog.open}
                onClose={handleDialogCancel}
                existingRecord={cpfDialog.record}
                recordType="funcionário"
                onView={handleDialogView}
                onEdit={handleDialogEdit}
            />

        </PageLayout>
    );
};

export default FuncionarioForm;