import {
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Paper, Button, Card, CardContent, Typography, Box, Divider, Chip
} from '@mui/material';
import { FiberNew } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageLayout from "../components/common/PageLayout";
import ActionButtons from "../components/common/ActionButtons";
import { getGrupoInfo } from '../constants/userGroups';
import { useMasks } from '../hooks/useMasks';

function FuncionarioList() {
    const navigate = useNavigate();

    const { applyCpfMask, applyPhoneMask } = useMasks();

    const funcionarios = [
        { id: 1, nome: 'Artur Bonamigo', matricula: '123456789', cpf: '11111111111', telefone: '49984211154', grupo: 1 },
        { id: 2, nome: 'Mariana', matricula: '987654321', cpf: '22222222222', telefone: '49984211151', grupo: 2 },
        { id: 3, nome: 'Zé das Batatas', matricula: '111111111', cpf: '33333333333', telefone: '49984211150', grupo: 3 },
        { id: 4, nome: 'José da Silva', matricula: '152102', cpf: '44444444444', telefone: '49984247785', grupo: 1 }
    ];

    const actions = (
        <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/funcionario')}
            startIcon={<FiberNew />}
            sx={{ fontWeight: 600, px: 2, py: 1 }}
        >
            Novo
        </Button>
    );

    const handleView = (funcionario) => {
        console.log("Visualizar funcionário:", funcionario);
    };

    const handleEdit = (funcionario) => {
        navigate(`/funcionario/${funcionario.id}`);
    };

    const handleDelete = (funcionario) => {
        console.log("Excluir funcionário:", funcionario);
    };

    const columns = [
        { field: 'id', headerName: 'ID' },
        { field: 'nome', headerName: 'Nome' },
        { field: 'matricula', headerName: 'Matrícula' },
        { field: 'cpf', headerName: 'CPF' },
        { field: 'telefone', headerName: 'Telefone' },
        { field: 'grupo', headerName: 'Grupo' },
        { field: 'actions', headerName: 'Ações' }
    ];

    const renderDesktopRow = (funcionario) => {
        const grupoInfo = getGrupoInfo(funcionario.grupo);

        return (
            <TableRow key={funcionario.id} hover>
                <TableCell>{funcionario.id}</TableCell>

                <TableCell sx={{ fontWeight: 500 }}>
                    {funcionario.nome}
                </TableCell>

                <TableCell>{funcionario.matricula}</TableCell>

                <TableCell>
                    {applyCpfMask(funcionario.cpf)}
                </TableCell>

                <TableCell>
                    {applyPhoneMask(funcionario.telefone)}
                </TableCell>

                <TableCell>
                    <Chip
                        label={grupoInfo.label}
                        color={grupoInfo.color}
                        size="small"
                    />
                </TableCell>

                <TableCell>
                    <ActionButtons
                        item={funcionario}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </TableCell>
            </TableRow>
        );
    };

    const renderMobileCard = (funcionario) => {
        const grupoInfo = getGrupoInfo(funcionario.grupo);

        return (
            <Card key={funcionario.id} sx={{ mb: 2, elevation: 2 }}>
                <CardContent sx={{ p: 2 }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                            {funcionario.nome}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            ID: {funcionario.id}
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2">
                            <strong>Matrícula:</strong> {funcionario.matricula}
                        </Typography>

                        <Typography variant="body2">
                            <strong>CPF:</strong> {applyCpfMask(funcionario.cpf)}
                        </Typography>

                        <Typography variant="body2">
                            <strong>Telefone:</strong> {applyPhoneMask(funcionario.telefone)}
                        </Typography>

                        <Box sx={{ mt: 1 }}>
                            <Chip
                                label={grupoInfo.label}
                                color={grupoInfo.color}
                                size="small"
                            />
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <ActionButtons
                            item={funcionario}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </Box>
                </CardContent>
            </Card>
        );
    };

    return (
        <PageLayout title="Funcionários" actions={actions}>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {columns.map((column, index) => (
                                    <TableCell key={index} sx={{ fontWeight: 600 }}>
                                        {column.headerName}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {funcionarios.map((funcionario) => renderDesktopRow(funcionario))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                {funcionarios.map((funcionario) => renderMobileCard(funcionario))}
            </Box>
        </PageLayout>
    );
}

export default FuncionarioList;