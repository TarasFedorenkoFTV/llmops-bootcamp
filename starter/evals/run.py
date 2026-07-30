import argparse
import json
import sys


def load_dataset(path):
    with open(path, encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def grade(case, answer):
    # TODO(student): rule-based + model-based graders.
    # Return True if the answer meets the case criteria.
    raise NotImplementedError


def run(dataset_path, threshold):
    cases = load_dataset(dataset_path)
    passed = 0
    for case in cases:
        # TODO(student): call the gateway, get the answer, grade it.
        answer = ""
        if grade(case, answer):
            passed += 1
    print(f"eval: {passed}/{len(cases)} passed, threshold {threshold}")
    return 0 if passed >= threshold else 1


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--dataset", required=True)
    p.add_argument("--threshold", type=int, required=True)
    args = p.parse_args()
    sys.exit(run(args.dataset, args.threshold))
