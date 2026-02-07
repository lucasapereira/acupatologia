// Mapping of acupuncture points to their anatomical region
// Points are mapped to the region where they can be found in the reference images

export type AnatomyRegionId = 'body_front' | 'body_back' | 'head_face' | 'hand_arm';

export const POINT_TO_REGION: Record<string, AnatomyRegionId> = {
    // Body Front - Stomach (E), Spleen (BP), Kidney (R), Liver (F), Lung (P), Large Intestine (IG), Conception Vessel (VC)
    'E25': 'body_front',
    'E36': 'body_front',
    'E37': 'body_front',
    'E40': 'body_front',
    'E44': 'body_front',
    'BP1': 'body_front',
    'BP4': 'body_front',
    'BP6': 'body_front',
    'BP9': 'body_front',
    'BP10': 'body_front',
    'BP14': 'body_front',
    'R1': 'body_front',
    'R2': 'body_front',
    'R3': 'body_front',
    'R6': 'body_front',
    'R7': 'body_front',
    'R9': 'body_front',
    'R10': 'body_front',
    'F1': 'body_front',
    'F2': 'body_front',
    'F3': 'body_front',
    'F8': 'body_front',
    'F13': 'body_front',
    'F14': 'body_front',
    'VC1': 'body_front',
    'VC3': 'body_front',
    'VC4': 'body_front',
    'VC5': 'body_front',
    'VC6': 'body_front',
    'VC7': 'body_front',
    'VC8': 'body_front',
    'VC9': 'body_front',
    'VC12': 'body_front',
    'VC14': 'body_front',
    'VC15': 'body_front',
    'VC17': 'body_front',
    'VC22': 'body_front',
    'VC23': 'body_front',
    'VC24': 'body_front',

    // Body Back - Bladder (B), Small Intestine (ID), Triple Burner (TA), Gallbladder (VB), Governor Vessel (VG)
    'B10': 'body_back',
    'B11': 'body_back',
    'B12': 'body_back',
    'B13': 'body_back',
    'B14': 'body_back',
    'B15': 'body_back',
    'B17': 'body_back',
    'B18': 'body_back',
    'B20': 'body_back',
    'B21': 'body_back',
    'B22': 'body_back',
    'B23': 'body_back',
    'B25': 'body_back',
    'B27': 'body_back',
    'B28': 'body_back',
    'B30': 'body_back',
    'B31': 'body_back',
    'B32': 'body_back',
    'B40': 'body_back',
    'B51': 'body_back',
    'B54': 'body_back',
    'B57': 'body_back',
    'B60': 'body_back',
    'B62': 'body_back',
    'VG1': 'body_back',
    'VG4': 'body_back',
    'VG6': 'body_back',
    'VG9': 'body_back',
    'VG10': 'body_back',
    'VG11': 'body_back',
    'VG12': 'body_back',
    'VG14': 'body_back',
    'VG17': 'body_back',
    'VG19': 'body_back',
    'VG20': 'body_back',
    'VG22': 'body_back',
    'VG24': 'body_back',
    'VG26': 'body_back',
    'VB20': 'body_back',
    'VB21': 'body_back',
    'VB30': 'body_back',
    'VB34': 'body_back',
    'VB35': 'body_back',
    'VB38': 'body_back',
    'VB39': 'body_back',
    'VB40': 'body_back',
    'VB41': 'body_back',
    'VB43': 'body_back',

    // Head and Face - Facial points
    'E2': 'head_face',
    'E4': 'head_face',
    'E6': 'head_face',
    'E7': 'head_face',
    'E8': 'head_face',
    'E9': 'head_face',
    'E18': 'head_face',
    'VB1': 'head_face',
    'VB2': 'head_face',
    'VB3': 'head_face',
    'VB6': 'head_face',
    'VB8': 'head_face',
    'VB9': 'head_face',
    'VB13': 'head_face',
    'VB14': 'head_face',
    'VB15': 'head_face',
    'B1': 'head_face',
    'B2': 'head_face',
    'ID17': 'head_face',
    'ID19': 'head_face',
    'IG17': 'head_face',
    'IG18': 'head_face',
    'IG19': 'head_face',
    'IG20': 'head_face',
    'TA17': 'head_face',
    'TA21': 'head_face',
    'TA22': 'head_face',
    'TA23': 'head_face',
    'Yintang': 'head_face',
    'Taiyang': 'head_face',

    // Arm and Hand - IG, P, C, ID, TA, CS meridians
    'P5': 'hand_arm',
    'P6': 'hand_arm',
    'P7': 'hand_arm',
    'P9': 'hand_arm',
    'P10': 'hand_arm',
    'P11': 'hand_arm',
    'IG1': 'hand_arm',
    'IG4': 'hand_arm',
    'IG5': 'hand_arm',
    'IG6': 'hand_arm',
    'IG10': 'hand_arm',
    'IG11': 'hand_arm',
    'IG15': 'hand_arm',
    'IG16': 'hand_arm',
    'C5': 'hand_arm',
    'C6': 'hand_arm',
    'C7': 'hand_arm',
    'C8': 'hand_arm',
    'C9': 'hand_arm',
    'ID1': 'hand_arm',
    'ID2': 'hand_arm',
    'ID3': 'hand_arm',
    'ID4': 'hand_arm',
    'ID5': 'hand_arm',
    'ID7': 'hand_arm',
    'ID11': 'hand_arm',
    'ID12': 'hand_arm',
    'ID13': 'hand_arm',
    'TA1': 'hand_arm',
    'TA3': 'hand_arm',
    'TA4': 'hand_arm',
    'TA5': 'hand_arm',
    'TA6': 'hand_arm',
    'TA8': 'hand_arm',
    'TA10': 'hand_arm',
    'TA14': 'hand_arm',
    'TA15': 'hand_arm',
    'CS3': 'hand_arm',
    'CS4': 'hand_arm',
    'CS6': 'hand_arm',
    'CS7': 'hand_arm',
    'CS9': 'hand_arm',
};

// Get the region name in Portuguese
export const REGION_NAMES: Record<AnatomyRegionId, string> = {
    'body_front': 'Corpo (Frente)',
    'body_back': 'Corpo (Costas)',
    'head_face': 'Cabeça e Face',
    'hand_arm': 'Braço e Mão',
};

// Extract point codes from a text string
export function extractPoints(text: string): string[] {
    // Match patterns like E36, BP6, IG4, VC12, VG14, etc.
    const pointPattern = /\b(E|BP|B|R|F|P|IG|ID|C|TA|CS|VC|VG|VB)\d+\b/gi;
    const matches: string[] = text.match(pointPattern) || [];

    // Also match special points like Yintang, Taiyang
    const specialPoints = ['Yintang', 'Taiyang'];
    specialPoints.forEach(point => {
        if (text.toLowerCase().includes(point.toLowerCase())) {
            matches.push(point);
        }
    });

    // Normalize and deduplicate
    const normalized = matches.map(p => p.toUpperCase());
    return [...new Set(normalized)];
}

// Check if a point has an associated image
export function hasPointImage(point: string): boolean {
    return point.toUpperCase() in POINT_TO_REGION;
}

// Get the region for a point
export function getPointRegion(point: string): AnatomyRegionId | null {
    return POINT_TO_REGION[point.toUpperCase()] || null;
}
