import logging
import os
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)


class MLflowTracker:
    """MLflow experiment tracking for SentimentFlow."""

    def __init__(self, experiment_name: str = "sentiment-ops"):
        self.experiment_name = experiment_name
        self.tracking_uri = os.getenv("MLFLOW_TRACKING_URI", "http://localhost:5000")
        self._run = None
        self._mlflow = None
        self._available = self._check_mlflow()

    def _check_mlflow(self) -> bool:
        try:
            import mlflow
            self._mlflow = mlflow
            mlflow.set_tracking_uri(self.tracking_uri)
            mlflow.set_experiment(self.experiment_name)
            return True
        except ImportError:
            logger.warning("MLflow not installed — tracking disabled")
            return False
        except Exception as e:
            logger.warning(f"MLflow unavailable: {e} — tracking disabled")
            return False

    def start_run(self, run_name: Optional[str] = None) -> None:
        if not self._available:
            return
        try:
            self._run = self._mlflow.start_run(run_name=run_name)
        except Exception as e:
            logger.warning(f"Failed to start MLflow run: {e}")

    def log_prediction(self, sentiment: str, confidence: float, latency_ms: float) -> None:
        if not self._available or not self._run:
            return
        try:
            self._mlflow.log_metrics({
                "confidence": confidence,
                "latency_ms": latency_ms,
            })
            self._mlflow.log_param("predicted_sentiment", sentiment)
        except Exception as e:
            logger.warning(f"Failed to log prediction metrics: {e}")

    def log_evaluation(self, metrics: Dict[str, Any], dataset: str, split: str) -> None:
        if not self._available:
            return
        try:
            with self._mlflow.start_run(run_name=f"eval-{dataset}-{split}"):
                self._mlflow.log_params({"dataset": dataset, "split": split})
                self._mlflow.log_metrics({
                    "accuracy": metrics.get("accuracy", 0),
                    "macro_f1": metrics.get("macro_f1", 0),
                    "macro_precision": metrics.get("macro_precision", 0),
                    "macro_recall": metrics.get("macro_recall", 0),
                })
        except Exception as e:
            logger.warning(f"Failed to log evaluation: {e}")

    def end_run(self) -> None:
        if not self._available or not self._run:
            return
        try:
            self._mlflow.end_run()
            self._run = None
        except Exception as e:
            logger.warning(f"Failed to end MLflow run: {e}")


_tracker_instance: Optional[MLflowTracker] = None


def get_tracker() -> MLflowTracker:
    global _tracker_instance
    if _tracker_instance is None:
        _tracker_instance = MLflowTracker()
    return _tracker_instance
