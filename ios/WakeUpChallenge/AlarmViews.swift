import SwiftUI

struct AlarmListView: View {
    @EnvironmentObject var store: AlarmStore
    @State private var showNew = false

    var body: some View {
        NavigationStack {
            List {
                ForEach($store.alarms) { $alarm in
                    HStack {
                        NavigationLink {
                            AlarmEditorView(alarm: $alarm)
                        } label: {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(String(format: "%02d:%02d", alarm.hour, alarm.minute))
                                    .font(.system(size: 40, weight: .light, design: .rounded))
                                Text("\(alarm.label) · \(alarm.challenges.map { $0.kind.title }.joined(separator: " → "))")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                                    .lineLimit(1)
                            }
                        }
                        Toggle("", isOn: $alarm.isEnabled).labelsHidden()
                    }
                }
                .onDelete { store.alarms.remove(atOffsets: $0) }
            }
            .navigationTitle("알람")
            .toolbar {
                Button { showNew = true } label: { Image(systemName: "plus") }
            }
            .sheet(isPresented: $showNew) {
                NewAlarmSheet().environmentObject(store)
            }
        }
    }
}

struct NewAlarmSheet: View {
    @EnvironmentObject var store: AlarmStore
    @Environment(\.dismiss) private var dismiss
    @State private var draft = Alarm()

    var body: some View {
        NavigationStack {
            AlarmEditorView(alarm: $draft)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("취소") { dismiss() }
                    }
                    ToolbarItem(placement: .confirmationAction) {
                        Button("저장") {
                            store.alarms.append(draft)
                            dismiss()
                        }
                        .disabled(draft.challenges.isEmpty)
                    }
                }
        }
    }
}

struct AlarmEditorView: View {
    @Binding var alarm: Alarm
    @StateObject private var locator = LocationChecker()
    @State private var time = Date()
    @State private var placeStatus = ""

    private var hasPhotoMission: Bool {
        alarm.challenges.contains { $0.kind == .photo }
    }

    var body: some View {
        Form {
            Section {
                DatePicker("시간", selection: $time, displayedComponents: .hourAndMinute)
                TextField("이름", text: $alarm.label)
            }

            Section("반복 요일") {
                WeekdayPicker(selection: $alarm.weekdays)
            }

            Section {
                ForEach(alarm.challenges) { item in
                    Label(item.kind.title, systemImage: "bolt.fill")
                }
                .onDelete { alarm.challenges.remove(atOffsets: $0) }
                .onMove { alarm.challenges.move(fromOffsets: $0, toOffset: $1) }

                Menu("미션 추가") {
                    Button("수학 문제 3개") { add(.math(problems: 3)) }
                    Button("수학 문제 5개") { add(.math(problems: 5)) }
                    Button("폰 흔들기 30회") { add(.shake(count: 30)) }
                    Button("문장 따라쓰기") { add(.typing(phrase: "지금 일어나서 물을 한 잔 마십니다")) }
                    Button("지정 장소 사진") { add(.photo) }
                    Button("걸음 50보") { add(.steps(count: 50)) }
                }
            } header: {
                Text("미션 (위에서 아래 순서대로 모두 완료해야 꺼짐)")
            }

            if hasPhotoMission {
                Section("사진 미션 지정 장소") {
                    Button("현재 위치를 장소로 지정") {
                        Task { await setPlace() }
                    }
                    Stepper("반경 \(Int(alarm.placeRadius))m",
                            value: $alarm.placeRadius, in: 30...500, step: 10)
                    if let p = alarm.place {
                        Text("지정됨: \(p.latitude, specifier: "%.5f"), \(p.longitude, specifier: "%.5f")")
                            .font(.caption)
                    }
                    if !placeStatus.isEmpty {
                        Text(placeStatus).font(.caption).foregroundStyle(.secondary)
                    }
                }
            }
        }
        .navigationTitle("알람 편집")
        .toolbar { EditButton() }
        .onAppear {
            time = Calendar.current.date(bySettingHour: alarm.hour, minute: alarm.minute, second: 0, of: .now) ?? .now
        }
        .onChange(of: time) { _, newValue in
            let c = Calendar.current.dateComponents([.hour, .minute], from: newValue)
            alarm.hour = c.hour ?? alarm.hour
            alarm.minute = c.minute ?? alarm.minute
        }
    }

    private func add(_ kind: ChallengeKind) {
        alarm.challenges.append(ChallengeItem(kind: kind))
    }

    private func setPlace() async {
        guard let loc = await locator.currentLocation() else {
            placeStatus = "위치를 가져오지 못했어요. 위치 권한을 확인해 주세요."
            return
        }
        alarm.place = GeoPoint(latitude: loc.coordinate.latitude, longitude: loc.coordinate.longitude)
        placeStatus = "장소가 지정되었습니다."
    }
}

struct WeekdayPicker: View {
    @Binding var selection: Set<Int>
    private let names = ["일", "월", "화", "수", "목", "금", "토"]

    var body: some View {
        HStack(spacing: 6) {
            ForEach(1...7, id: \.self) { day in
                let isOn = selection.contains(day)
                Button {
                    if isOn { selection.remove(day) } else { selection.insert(day) }
                } label: {
                    Text(names[day - 1])
                        .font(.subheadline.bold())
                        .frame(maxWidth: .infinity, minHeight: 34)
                        .background(isOn ? Color.accentColor : Color.gray.opacity(0.15), in: Capsule())
                        .foregroundStyle(isOn ? Color.white : Color.primary)
                }
                .buttonStyle(.borderless)
            }
        }
    }
}
