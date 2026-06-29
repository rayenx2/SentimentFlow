#!/usr/bin/env python3
"""Data drift detection using Kolmogorov-Smirnov test."""
import argparse
import json
import logging
from typing import Any, Dict, List

logger = logging.getLogger(__name__)


class DriftDetector:
    """Detects data drift in text length distributions using KS test."""

    def __init__(self, threshold: float = 0.05):
        self.threshold = threshold

    def extract_features(self, texts: List[str]) -> List[float]:
        return [float(len(t)) for t in texts]

    def detect_drift(self, reference_texts: List[str], current_texts: List[str]) -> Dict[str, Any]:
        try:
            from scipy import stats
        except ImportError:
            return {
                "drift_detected": False,
                "error": "scipy not installed",
                "ks_statistic": 0.0,
                "p_value": 1.0,
            }

        ref_features = self.extract_features(reference_texts)
        cur_features = self.extract_features(current_texts)

        ks_stat, p_value = stats.ks_2samp(ref_features, cur_features)
        drift_detected = p_value < self.threshold

        result = {
            "drift_detected": drift_detected,
            "ks_statistic": float(ks_stat),
            "p_value": float(p_value),
            "threshold": self.threshold,
            "reference_size": len(reference_texts),
            "current_size": len(current_texts),
        }

        if drift_detected:
            logger.warning(f"Data drift detected! KS={ks_stat:.4f}, p={p_value:.4f}")
        else:
            logger.info(f"No drift detected. KS={ks_stat:.4f}, p={p_value:.4f}")

        return result


def main():
    parser = argparse.ArgumentParser(description="Detect data drift in text datasets")
    parser.add_argument("--reference", required=True, help="Path to reference JSON (list of strings)")
    parser.add_argument("--current", required=True, help="Path to current JSON (list of strings)")
    parser.add_argument("--threshold", type=float, default=0.05, help="P-value threshold (default: 0.05)")
    args = parser.parse_args()

    with open(args.reference) as f:
        reference = json.load(f)
    with open(args.current) as f:
        current = json.load(f)

    detector = DriftDetector(threshold=args.threshold)
    result = detector.detect_drift(reference, current)
    print(json.dumps(result, indent=2))
    return 1 if result["drift_detected"] else 0


if __name__ == "__main__":
    exit(main())
