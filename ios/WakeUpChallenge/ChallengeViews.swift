import SwiftUI
import CoreMotion
import CoreLocation
import UIKit

// MARK: - 1. 수학 문제

struct MathProblem: Identifiable {
    let id = UUID()
    let a: Int
    let b: Int
    let isMultiply: Bool

    var answer: Int { isMultiply ? a * b : a + b }
    var text: String { "\(a) \(isMultiply ? "×" : "+") \(b) = ?" }

    static func random() -> MathProblem {
        if Bool.random() {
            return MathProblem(a: Int.random(in: 11...29), b: Int.random(in: 6...9), isMultiply: true)
        }
        return MathProblem(a: Int.random(in: 100...999), b: Int.random(in: 100...999), isMultiply: false)
    }
}

struct MathStepView: View {
    let total: Int
    let onDone: () -> Void

    @State private var problems: [MathProblem] = []
    @State private var index = 0
    @State private var input = ""
    @State private var wrong = false
    @State private var finished = false

    var body: some View {
        VStack(spacing: 24) {
            if index < problems.count {
                Text(problems[index].text)
                    .font(.system(size: 44, weight: .bold, design: .rounded))
            }
            TextField("정답 입력", text: $input)
                .keyboardType(.numberPad)
                .multilineTextAlignment(.center)
                .font(.title)
                .textFieldStyle(.roundedBorder)
            if wrong {
                Text("틀렸어요. 다시 계산해 보세요!").foregroundStyle(.red)
            }
            Button("확인", action: submit)
                .buttonStyle(.borderedProminent)
                .disabled(input.isEmpty)
        }
        .padding()
        .onAppear {
            if problems.isEmpty {
                problems = (0..<total).map { _ in MathProblem.random() }
            }
        }
    }

    private func submit() {
        guard index < problems.count, !finished else { return }
        if Int(input) == problems[index].answer {
            wrong = false
            input = ""
            index += 1
            if index >= problems.count {
                finished = true
                onDone()
            }
        } else {
            wrong = true
            input = ""
        }
    }
}

// MARK: - 2. 폰 흔들기 (가속度계)

final class ShakeDetector: ObservableObject {
    @Published private(set) var count = 0
    private let motion = CMMotionManager()
    private var lastShake = Date.distantPast

    func start() {
        guard motion.isAccelerometerAvailable else { return }
        motion.accelerometerUpdateInterval = 1.0 / 30.0
        motion.startAccelerometerUpdates(to: .main) { [weak self] data, _ in
            guard let self, let a = data?.acceleration else { return }
            let g = (a.x * a.x + a.y * a.y + a.z * a.z).squareRoot()
            if g > 2.5, Date().timeIntervalSince(self.lastShake) > 0.4 {
                self.lastShake = Date()
                self.count += 1
            }
        }
    }

    func stop() {
        motion.stopAccelerometerUpdates()
    }
}

struct ShakeStepView: View {
    let target: Int
    let onDone: () -> Void

    @StateObject private var detector = ShakeDetector()
    @State private var finished = false

    var body: some View {
        let current = min(detector.count, target)
        VStack(spacing: 16) {
            Image(systemName: "iphone.radiowaves.left.and.right")
                .font(.system(size: 60))
            Text("폰을 세게 흔드세요").font(.headline)
            ProgressView(value: Double(current), total: Double(target))
            Text("\(current) / \(target)")
        }
        .padding()
        .onAppear { detector.start() }
        .onDisappear { detector.stop() }
        .onChange(of: detector.count) { _, newValue in
            if newValue >= target, !finished {
                finished = true
                onDone()
            }
        }
    }
}

// MARK: - 3. 문장 따라쓰기

struct TypingStepView: View {
    let phrase: String
    let onDone: () -> Void

    @State private var input = ""
    @State private var wrong = false
    @State private var finished = false

    var body: some View {
        VStack(spacing: 20) {
            Text("아래 문장을 똑같이 입력하세요").font(.headline)
            Text(phrase)
                .font(.title3.bold())
                .multilineTextAlignment(.center)
            TextField("입력", text: $input, axis: .vertical)
                .textFieldStyle(.roundedBorder)
                .autocorrectionDisabled()
            if wrong {
                Text("문장이 다릅니다. 다시 입력하세요.").foregroundStyle(.red)
            }
            Button("확인") {
                guard !finished else { return }
                if input.trimmingCharacters(in: .whitespacesAndNewlines) == phrase {
                    finished = true
                    onDone()
                } else {
                    wrong = true
                }
            }
            .buttonStyle(.borderedProminent)
            .disabled(input.isEmpty)
        }
        .padding()
    }
}

// MARK: - 4. 지정 장소 사진

struct PhotoStepView: View {
    let place: GeoPoint?
    let radius: Double
    let onDone: () -> Void

    @StateObject private var locator = LocationChecker()
    @State private var showCamera = false
    @State private var checking = false
    @State private var message = "지정된 장소에서 사진을 찍어 주세요"
    @State private var finished = false

    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "camera.fill")
                .font(.system(size: 60))
            Text(message)
                .multilineTextAlignment(.center)
            if checking { ProgressView() }
            Button("사진 촬영") { showCamera = true }
                .buttonStyle(.borderedProminent)
                .disabled(checking)
        }
        .padding()
        .fullScreenCover(isPresented: $showCamera) {
            CameraPicker { image in
                showCamera = false
                if image != nil {
                    Task { await verify() }
                }
            }
            .ignoresSafeArea()
        }
    }

    private func verify() async {
        guard !finished else { return }
        // 장소를 지정하지 않은 알람이면 사진만 찍으면 통과
        guard let place else {
            finished = true
            onDone()
            return
        }
        checking = true
        defer { checking = false }

        guard let loc = await locator.currentLocation() else {
            message = "위치를 확인할 수 없어요. 위치 권한을 확인하고 다시 찍어 주세요."
            return
        }
        if loc.distance(from: place.clLocation) <= radius {
            finished = true
            onDone()
        } else {
            message = "지정된 장소가 아닙니다. 다시 찍어 주세요."
        }
    }
}

struct CameraPicker: UIViewControllerRepresentable {
    let onCapture: (UIImage?) -> Void

    func makeCoordinator() -> Coordinator {
        Coordinator(onCapture: onCapture)
    }

    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = UIImagePickerController.isSourceTypeAvailable(.camera) ? .camera : .photoLibrary
        picker.delegate = context.coordinator
        return picker
    }

    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}

    final class Coordinator: NSObject, UINavigationControllerDelegate, UIImagePickerControllerDelegate {
        let onCapture: (UIImage?) -> Void

        init(onCapture: @escaping (UIImage?) -> Void) {
            self.onCapture = onCapture
        }

        func imagePickerController(_ picker: UIImagePickerController,
                                   didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            onCapture(info[.originalImage] as? UIImage)
        }

        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            onCapture(nil)
        }
    }
}

/// 현재 위치를 한 번 가져오는 헬퍼 (권한 요청 포함)
final class LocationChecker: NSObject, ObservableObject, CLLocationManagerDelegate {
    private let manager = CLLocationManager()
    private var continuation: CheckedContinuation<CLLocation?, Never>?

    override init() {
        super.init()
        manager.delegate = self
    }

    func currentLocation() async -> CLLocation? {
        await withCheckedContinuation { cont in
            continuation = cont
            if manager.authorizationStatus == .notDetermined {
                manager.requestWhenInUseAuthorization()
            } else {
                manager.requestLocation()
            }
        }
    }

    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        guard continuation != nil else { return }
        switch manager.authorizationStatus {
        case .authorizedWhenInUse, .authorizedAlways:
            manager.requestLocation()
        case .denied, .restricted:
            finish(nil)
        default:
            break
        }
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        finish(locations.last)
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        finish(nil)
    }

    private func finish(_ location: CLLocation?) {
        continuation?.resume(returning: location)
        continuation = nil
    }
}

// MARK: - 5. 걸음 수

final class StepCounter: ObservableObject {
    @Published private(set) var steps = 0
    private let pedometer = CMPedometer()

    func start() {
        guard CMPedometer.isStepCountingAvailable() else { return }
        pedometer.startUpdates(from: Date()) { [weak self] data, _ in
            guard let n = data?.numberOfSteps.intValue else { return }
            DispatchQueue.main.async { self?.steps = n }
        }
    }

    func stop() {
        pedometer.stopUpdates()
    }
}

struct StepsStepView: View {
    let target: Int
    let onDone: () -> Void

    @StateObject private var counter = StepCounter()
    @State private var finished = false

    var body: some View {
        let current = min(counter.steps, target)
        VStack(spacing: 16) {
            Image(systemName: "figure.walk")
                .font(.system(size: 60))
            Text("방 안을 걸어 다니세요").font(.headline)
            ProgressView(value: Double(current), total: Double(target))
            Text("\(current) / \(target) 보")
        }
        .padding()
        .onAppear { counter.start() }
        .onDisappear { counter.stop() }
        .onChange(of: counter.steps) { _, newValue in
            if newValue >= target, !finished {
                finished = true
                onDone()
            }
        }
    }
}
