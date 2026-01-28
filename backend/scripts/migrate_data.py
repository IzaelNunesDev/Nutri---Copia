"""
Script de Migração de Dados - MongoDB
=====================================

Este script migra os dados antigos para o novo formato de schema.

Alterações:
1. Pacientes: Adiciona campo peso_pre_gestacional se não existir
2. Avaliações: Atualiza estrutura de calculos, relatorio e respostas_checklist

Para executar localmente:
    cd backend
    python -m scripts.migrate_data

Para executar em produção (Render):
    Configurar MONGODB_URL no ambiente e executar o script
"""

import asyncio
import os
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

# Configuração do MongoDB
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGODB_DB_NAME", "nutri_gestantes")


async def migrate_pacientes(db):
    """
    Migra os pacientes antigos adicionando peso_pre_gestacional se não existir
    """
    print("\n📋 Migrando pacientes...")
    
    # Encontra pacientes sem peso_pre_gestacional
    pacientes_sem_peso = await db.pacientes.count_documents({
        "peso_pre_gestacional": {"$exists": False}
    })
    
    print(f"   Encontrados {pacientes_sem_peso} pacientes sem peso_pre_gestacional")
    
    if pacientes_sem_peso > 0:
        # Atualiza todos para ter o campo (como None por enquanto)
        result = await db.pacientes.update_many(
            {"peso_pre_gestacional": {"$exists": False}},
            {"$set": {"peso_pre_gestacional": None}}
        )
        print(f"   ✅ Atualizados {result.modified_count} pacientes")
    else:
        print("   ✅ Nenhuma migração necessária")


async def migrate_avaliacoes(db):
    """
    Migra as avaliações antigas para o novo formato:
    - Converte boolean para string em respostas_checklist
    - Atualiza estrutura de calculos
    - Adiciona title nos itens de relatorio
    """
    print("\n📊 Migrando avaliações...")
    
    # Busca todas as avaliações
    total_avaliacoes = await db.avaliacoes.count_documents({})
    print(f"   Total de avaliações: {total_avaliacoes}")
    
    migradas = 0
    erros = 0
    
    cursor = db.avaliacoes.find({})
    async for avaliacao in cursor:
        try:
            updates = {}
            avaliacao_id = avaliacao["_id"]
            
            # 1. Migrar respostas_checklist (boolean -> string)
            respostas = avaliacao.get("respostas_checklist", {})
            if respostas:
                novos_respostas = {}
                campos_bool = [
                    'fruits_vegetables', 'dairy_products', 'whole_grains',
                    'meat_poultry_eggs', 'plant_proteins', 'fish_consumption',
                    'processed_foods', 'physical_activity', 'coffee_tea_consumption',
                    'substances_use'
                ]
                
                for campo in campos_bool:
                    valor = respostas.get(campo)
                    if isinstance(valor, bool):
                        novos_respostas[campo] = "Sim" if valor else "Não"
                    elif valor is not None:
                        novos_respostas[campo] = valor
                
                # Mantém os outros campos
                for key, val in respostas.items():
                    if key not in campos_bool:
                        novos_respostas[key] = val
                    elif key not in novos_respostas:
                        novos_respostas[key] = val
                
                updates["respostas_checklist"] = novos_respostas
            
            # 2. Migrar calculos (formato antigo -> novo)
            calculos = avaliacao.get("calculos", {})
            if calculos:
                novos_calculos = {
                    "imc_pre_gestacional": calculos.get("imc_pre_gestacional", calculos.get("imc", 0)),
                    "imc_classification": calculos.get("imc_classification", "Não calculado"),
                    "peso_atual": calculos.get("peso_atual", avaliacao.get("peso_atual", 0)),
                    "ganho_peso_atual": calculos.get("ganho_peso_atual", calculos.get("weight_gain", 0)),
                    "trimestre": calculos.get("trimestre", "Não informado"),
                    "weight_gain_recommendation": calculos.get("weight_gain_recommendation", "")
                }
                updates["calculos"] = novos_calculos
            
            # 3. Migrar relatorio (adicionar title se não existir)
            relatorio = avaliacao.get("relatorio", {})
            if relatorio:
                novo_relatorio = {}
                
                for categoria in ["alertas_criticos", "recomendacoes", "adequados"]:
                    itens = relatorio.get(categoria, [])
                    novos_itens = []
                    
                    for item in itens:
                        novo_item = dict(item)
                        if "title" not in novo_item:
                            # Gera um título baseado no item_id
                            item_id = novo_item.get("item_id", "item")
                            titulo_map = {
                                "dietary_pattern": "Padrão Alimentar",
                                "fruits_vegetables": "Frutas e Vegetais",
                                "dairy_products": "Laticínios",
                                "whole_grains": "Grãos Integrais",
                                "meat_poultry_eggs": "Carnes e Ovos",
                                "plant_proteins": "Proteínas Vegetais",
                                "fish_consumption": "Consumo de Peixe",
                                "processed_foods": "Alimentos Processados",
                                "folic_acid_supplement": "Ácido Fólico",
                                "iron_supplement": "Ferro",
                                "calcium_supplement": "Cálcio",
                                "sun_exposure": "Exposição Solar",
                                "anemia_test": "Exame de Anemia",
                                "physical_activity": "Atividade Física",
                                "coffee_tea_consumption": "Café e Chá",
                                "substances_use": "Substâncias"
                            }
                            novo_item["title"] = titulo_map.get(item_id, item_id.replace("_", " ").title())
                        novos_itens.append(novo_item)
                    
                    novo_relatorio[categoria] = novos_itens
                
                updates["relatorio"] = novo_relatorio
            
            # 4. Garantir que peso_pre_gestacional existe
            if "peso_pre_gestacional" not in avaliacao:
                updates["peso_pre_gestacional"] = None
            
            # Aplica as atualizações
            if updates:
                await db.avaliacoes.update_one(
                    {"_id": avaliacao_id},
                    {"$set": updates}
                )
                migradas += 1
                
        except Exception as e:
            print(f"   ❌ Erro ao migrar avaliação {avaliacao.get('_id')}: {e}")
            erros += 1
    
    print(f"   ✅ Migradas: {migradas} | Erros: {erros}")


async def run_migration():
    """
    Executa a migração completa
    """
    print("=" * 50)
    print("🚀 INICIANDO MIGRAÇÃO DE DADOS")
    print("=" * 50)
    print(f"📅 Data: {datetime.now().isoformat()}")
    print(f"🗄️  Database: {DB_NAME}")
    
    # Conecta ao MongoDB
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    
    try:
        # Testa conexão
        await client.admin.command('ping')
        print("✅ Conectado ao MongoDB")
        
        # Executa migrações
        await migrate_pacientes(db)
        await migrate_avaliacoes(db)
        
        print("\n" + "=" * 50)
        print("✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!")
        print("=" * 50)
        
    except Exception as e:
        print(f"\n❌ ERRO NA MIGRAÇÃO: {e}")
        raise
    finally:
        client.close()



if __name__ == "__main__":
    asyncio.run(run_migration())
