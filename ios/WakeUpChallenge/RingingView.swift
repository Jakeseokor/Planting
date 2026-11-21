import SwiftUI

/// 알람이 울릴 때 전체 화면으로 뜨는 미션 화면. 미션을 모두 끝내기 전에는 닫을 수 없다.
struct RingingView: View {
    @EnvironmentObject var store: AlarmStore
    @State private var stepIndex = 0

    private var alarm: Alarm? {
        store.alarms.first { $0.id == store.ringingAlarmID }
    }

    var body: some View {
        if let alarm, !alarm.challenges.isEmpty {
            let index = min(stepIndex, alarm.challenges.count - 1)
            let item = alarm.challenges[index]

            VStack(spacing: 20) {
                TimelineView(.everyMinute) { context in
                    Text(context.date, style: .time)
                        .font(.system(size: 64, weight: .bold, design: .rounded))
                }
                Text(alarm.label).font(.title2)

                ProgressView(value: Double(index), total: Double(alarm.challenges.count))
                Text("미션 \(index + 1) / \(alarm.challenges.count) · \(item.kind.title)")
                    .font(.headline)
                    .multilineTextAlignment(.center)

                challengeView(item.kind, alarm: alarm)
                    .id(index)

                Spacer(minLength: 0)
            }
            .padding()
            .interactiveDismissDisabled()
        } else {
            VStack(spacing: 16) {
                Text("알람 정보를 찾을 수 없습니다.")
                Button("닫기") { store.ringingAlarmID = nil }
            }
            .padding()
        }
    }

    @ViewBuilder
    private func challengeView(_ kind: ChallengeKind, alarm: Alarm) -> some View {
        switch kind {
        case .math(let n):
            MathStepView(total: n, onDone: advance)
        case .shake(let n):
            ShakeStepView(target: n, onDone: advance)
        case .typing(let phrase):
            TypingStepView(phrase: phrase, onDone: advance)
        case .photo:
            PhotoStepView(place: alarm.place, radius: alarm.placeRadius, onDone: advance)
        case .steps(let n):
            StepsStepView(target: n, onDone: advance)
        }
    }

    private func advance() {
        guard let alarm else { return }
        if stepIndex + 1 >= alarm.challenges.count {
            store.markCompleted(alarm.id)
        } else {
            stepIndex += 1
        }
    }
}
