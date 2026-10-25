from datetime import datetime
from airflow import DAG
from airflow.providers.standard.operators.bash import BashOperator


with DAG(
    dag_id="afl_weekly",
    start_date=datetime(2026, 9,7),
    schedule="0 8 * * 1",
    catchup=False,
    tags=["AFL"],
) as dag:

    run_afl_tables = BashOperator(
        task_id="afl_fantasy_ETL",
        bash_command="python /opt/airflow/scripts/afl_tables.py",
        execution_timeout=timedelta(minutes=15),
    )