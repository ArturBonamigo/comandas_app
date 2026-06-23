import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    Close,
    Image as ImageIcon,
    PointOfSale,
    Print,
    Refresh,
    ReceiptLong,
} from '@mui/icons-material';
import PageLayout from '../components/common/PageLayout';
import recebimentoService from '../services/recebimentoService';
import showSnackbar from '../utils/snackbar';

const currency = (value) => Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

const productImageSrc = (foto) => {
    if (!foto || typeof foto !== 'string') return null;
    if (foto.startsWith('data:image') || foto.startsWith('http')) return foto;
    return `data:image/jpeg;base64,${foto}`;
};

const Caixa = () => {
    const [comandas, setComandas] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [detalhe, setDetalhe] = useState(null);
    const [comprovante, setComprovante] = useState(null);
    const [desconto, setDesconto] = useState(0);
    const [acrescimo, setAcrescimo] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingDetalhe, setLoadingDetalhe] = useState(false);
    const [recebendo, setRecebendo] = useState(false);

    const valorBruto = Number(detalhe?.valor_bruto || 0);
    const valorFinal = useMemo(() => {
        return Math.max(valorBruto - Number(desconto || 0) + Number(acrescimo || 0), 0);
    }, [valorBruto, desconto, acrescimo]);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const data = await recebimentoService.dashboard();
            setComandas(data);
        } catch (error) {
            const mensagem = error.apiMessage || 'Erro ao carregar comandas abertas';
            showSnackbar(mensagem, 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadDetalhe = async (ids) => {
        if (ids.length === 0) {
            setDetalhe(null);
            return;
        }

        try {
            setLoadingDetalhe(true);
            const data = await recebimentoService.detalhe(ids);
            setDetalhe(data);
        } catch (error) {
            const mensagem = error.apiMessage || 'Erro ao carregar detalhes das comandas';
            showSnackbar(mensagem, 'error');
            setDetalhe(null);
        } finally {
            setLoadingDetalhe(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    useEffect(() => {
        loadDetalhe(selectedIds);
    }, [selectedIds]);

    const handleSelect = (id) => {
        setSelectedIds((current) => (
            current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id]
        ));
    };

    const handleSelectAll = () => {
        if (selectedIds.length === comandas.length) {
            setSelectedIds([]);
            return;
        }
        setSelectedIds(comandas.map((comanda) => comanda.id));
    };

    const handleReceber = async () => {
        if (selectedIds.length === 0) {
            showSnackbar('Selecione ao menos uma comanda', 'warning');
            return;
        }

        try {
            setRecebendo(true);
            const recebimento = await recebimentoService.receber({
                comanda_ids: selectedIds,
                desconto: Number(desconto || 0),
                acrescimo: Number(acrescimo || 0),
            });
            const comprovanteData = await recebimentoService.comprovante(recebimento.id);
            setComprovante(comprovanteData);
            setSelectedIds([]);
            setDetalhe(null);
            setDesconto(0);
            setAcrescimo(0);
            await loadDashboard();
            showSnackbar('Recebimento realizado com sucesso!', 'success');
        } catch (error) {
            const mensagem = error.apiMessage || 'Erro ao processar recebimento';
            showSnackbar(mensagem, 'error');
        } finally {
            setRecebendo(false);
        }
    };

    const actions = (
        <Tooltip title="Atualizar comandas" arrow>
            <IconButton color="inherit" onClick={loadDashboard} disabled={loading}>
                <Refresh />
            </IconButton>
        </Tooltip>
    );

    const renderComandas = () => {
        if (loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress />
                </Box>
            );
        }

        if (comandas.length === 0) {
            return (
                <Alert severity="info">
                    Nenhuma comanda aberta encontrada.
                </Alert>
            );
        }

        return (
            <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    checked={comandas.length > 0 && selectedIds.length === comandas.length}
                                    indeterminate={selectedIds.length > 0 && selectedIds.length < comandas.length}
                                    onChange={handleSelectAll}
                                />
                            </TableCell>
                            <TableCell>Comanda</TableCell>
                            <TableCell>Abertura</TableCell>
                            <TableCell>Cliente</TableCell>
                            <TableCell align="right">Itens</TableCell>
                            <TableCell align="right">Total</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {comandas.map((comanda) => (
                            <TableRow
                                key={comanda.id}
                                hover
                                selected={selectedIds.includes(comanda.id)}
                                onClick={() => handleSelect(comanda.id)}
                                sx={{ cursor: 'pointer' }}
                            >
                                <TableCell padding="checkbox">
                                    <Checkbox checked={selectedIds.includes(comanda.id)} />
                                </TableCell>
                                <TableCell>
                                    <Typography sx={{ fontWeight: 700 }}>
                                        {comanda.comanda}
                                    </Typography>
                                </TableCell>
                                <TableCell>{new Date(comanda.data_hora).toLocaleString('pt-BR')}</TableCell>
                                <TableCell>{comanda.cliente?.nome || comanda.cliente_id || '-'}</TableCell>
                                <TableCell align="right">
                                    <Chip label={comanda.quantidade_itens} size="small" />
                                </TableCell>
                                <TableCell align="right">{currency(comanda.total)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    const renderDetalhe = () => {
        if (selectedIds.length === 0) {
            return (
                <Alert severity="info">
                    Selecione uma ou mais comandas abertas.
                </Alert>
            );
        }

        if (loadingDetalhe) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress />
                </Box>
            );
        }

        if (!detalhe) return null;

        return (
            <Stack spacing={2}>
                {detalhe.comandas.map((comanda) => (
                    <Paper key={comanda.id} variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Comanda {comanda.comanda}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {comanda.cliente?.nome || 'Cliente nao identificado'}
                                </Typography>
                            </Box>
                            <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                                {currency(comanda.total)}
                            </Typography>
                        </Box>

                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Produto</TableCell>
                                        <TableCell align="right">Qtd.</TableCell>
                                        <TableCell align="right">Unitario</TableCell>
                                        <TableCell align="right">Total</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {comanda.produtos.map((item) => {
                                        const src = productImageSrc(item.produto?.foto);
                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Avatar
                                                            src={src || undefined}
                                                            variant="rounded"
                                                            sx={{ width: 44, height: 44, bgcolor: 'grey.100' }}
                                                        >
                                                            <ImageIcon fontSize="small" />
                                                        </Avatar>
                                                        <Box>
                                                            <Typography sx={{ fontWeight: 600 }}>
                                                                {item.produto?.nome || `Produto ${item.produto_id}`}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {item.produto?.descricao || '-'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="right">{item.quantidade}</TableCell>
                                                <TableCell align="right">{currency(item.valor_unitario)}</TableCell>
                                                <TableCell align="right">{currency(item.valor_total)}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                ))}
            </Stack>
        );
    };

    const renderComprovante = () => {
        if (!comprovante) return null;

        const recebimento = comprovante.recebimento;

        return (
            <Dialog open={!!comprovante} onClose={() => setComprovante(null)} fullWidth maxWidth="md">
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ReceiptLong />
                        Comprovante #{recebimento.id}
                    </Box>
                    <IconButton onClick={() => setComprovante(null)}>
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                            <Box>
                                <Typography variant="body2" color="text.secondary">Recebido por</Typography>
                                <Typography sx={{ fontWeight: 700 }}>
                                    {recebimento.funcionario?.nome || `Funcionario ${recebimento.funcionario_id}`}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">Data</Typography>
                                <Typography sx={{ fontWeight: 700 }}>
                                    {new Date(recebimento.data_hora).toLocaleString('pt-BR')}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider />

                        {comprovante.detalhes.comandas.map((comanda) => (
                            <Box key={comanda.id}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                                    Comanda {comanda.comanda} - {currency(comanda.total)}
                                </Typography>
                                {comanda.produtos.map((item) => (
                                    <Box
                                        key={item.id}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            gap: 2,
                                            py: 0.5,
                                        }}
                                    >
                                        <Typography variant="body2">
                                            {item.quantidade}x {item.produto?.nome || `Produto ${item.produto_id}`}
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {currency(item.valor_total)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        ))}

                        <Divider />

                        <Box sx={{ display: 'grid', gap: 1, maxWidth: 360, ml: 'auto', width: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography>Subtotal</Typography>
                                <Typography>{currency(recebimento.valor_bruto)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography>Desconto</Typography>
                                <Typography>{currency(recebimento.desconto)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography>Acrescimo</Typography>
                                <Typography>{currency(recebimento.acrescimo)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>Total</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>{currency(recebimento.valor_final)}</Typography>
                            </Box>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button startIcon={<Print />} onClick={() => window.print()}>
                        Imprimir
                    </Button>
                    <Button variant="contained" onClick={() => setComprovante(null)}>
                        Fechar
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    return (
        <PageLayout title="Caixa" actions={actions}>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: 'minmax(0, 1fr)',
                        lg: 'minmax(0, 1fr) 340px',
                    },
                    gap: 3,
                    width: '100%',
                }}
            >
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <ReceiptLong color="primary" />
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Comandas abertas
                        </Typography>
                    </Box>
                    {renderComandas()}
                </Box>

                <Box>
                    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <PointOfSale color="primary" />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                Recebimento
                            </Typography>
                        </Box>

                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                                <Typography>Selecionadas</Typography>
                                <Typography sx={{ fontWeight: 700 }}>{selectedIds.length}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                                <Typography>Subtotal</Typography>
                                <Typography sx={{ fontWeight: 700 }}>{currency(valorBruto)}</Typography>
                            </Box>
                            <TextField
                                label="Desconto"
                                type="number"
                                value={desconto}
                                onChange={(event) => setDesconto(event.target.value)}
                                inputProps={{ min: 0, step: '0.01' }}
                                size="small"
                                fullWidth
                            />
                            <TextField
                                label="Acrescimo"
                                type="number"
                                value={acrescimo}
                                onChange={(event) => setAcrescimo(event.target.value)}
                                inputProps={{ min: 0, step: '0.01' }}
                                size="small"
                                fullWidth
                            />
                            <Divider />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>Total final</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>{currency(valorFinal)}</Typography>
                            </Box>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<PointOfSale />}
                                onClick={handleReceber}
                                disabled={recebendo || selectedIds.length === 0 || loadingDetalhe}
                                fullWidth
                            >
                                {recebendo ? 'Processando...' : 'Finalizar recebimento'}
                            </Button>
                        </Stack>
                    </Paper>

                    {renderDetalhe()}
                </Box>
            </Box>

            {renderComprovante()}
        </PageLayout>
    );
};

export default Caixa;
